/* eslint-disable no-redeclare */
import { coerceArray } from "../misc/";
import {
    ASTNodeMap,
    ASTNodeKind,
    CallableDefinition,
    ContractDefinition,
    FunctionDefinition,
    ASTNodeType
} from "./implementation";
import { ASTNode } from "./ast_node";
import { ContractKind, FunctionVisibility, StateVariableVisibility } from "./constants";
import { XPath } from "./xpath";

export type StringOrNumberAttributes<T> = {
    [K in OnlyStringNumberAttrNames<T, keyof T>]: T[K] extends string | number | undefined
        ? T[K]
        : never;
};

export type OnlyStringNumberAttrNames<T, K extends keyof T> = K extends string
    ? T[K] extends string | number | undefined
        ? K
        : never
    : never;

export type OnlyNodeAttrNames<T, K extends keyof T> = K extends string
    ? T[K] extends ASTNodeType | undefined
        ? K
        : never
    : never;

export type NodeAttributes<T> = {
    [K in OnlyNodeAttrNames<T, keyof T>]: T[K] extends infer Node | undefined
        ? Node extends ASTNodeType
            ? SolSearchAttributes<Node["type"]>
            : never
        : never;
};

// type Attr = NodeAttributes<ASTNodeMap["VariableDeclaration"]>;
// type l = Attr[""]
// type ab = number | undefined;
// type cd = string | undefined;
// type l = ab extends string | number | undefined ? true : false;
/* 


const args: SolSearchAttributes<"VariableDeclaration"> = {
  vType: {}
}; */

export class ASTSearch {
    private xPaths: XPath[] = [];

    constructor(nodes: ASTNode[]) {
        this.xPaths = nodes.map((unit) => new XPath(unit));
    }

    queryAll<T = any>(xPathQueryString: string): T[] {
        const result: T[] = [];
        for (const xpath of this.xPaths) {
            result.push(...(xpath.query(xPathQueryString) || []));
        }
        return result;
    }

    findContract(name: string): ContractDefinition {
        return this.queryAll<ContractDefinition>(`//ContractDefinition[@name="${name}"]`)[0];
    }

    findFunctionsByName(name: string): FunctionDefinition[] {
        return this.queryAll(`//FunctionDefinition[@name="${name}"]`);
    }

    find<T extends ASTNodeKind>(
        tag: T,
        attributes: SolSearchAttributes<T> = {}
    ): Array<ASTNodeMap[T]> {
        return this.queryAll("//" + getSolPropertySelectors(tag, attributes));
    }

    findFunctionsByVisibility(
        visibility: FunctionVisibility
    ): Array<ASTNodeMap["FunctionDefinition"]> {
        return this.find("FunctionDefinition", { visibility });
    }

    findStateVariablesByVisibility(
        visibility: StateVariableVisibility
    ): Array<ASTNodeMap["VariableDeclaration"]> {
        return this.find("VariableDeclaration", { visibility });
    }

    findFunctionCalls<C extends CallableDefinition>(fn: C): Array<ASTNodeMap["FunctionCall"]> {
        return this.find("FunctionCall", { vIdentifier: fn.name }).filter(
            (fnCall) => fnCall.vReferencedDeclaration?.id === fn.id
        );
    }

    isFunctionInternallyReferenced(fn: CallableDefinition): boolean {
        return this.findFunctionCalls(fn).length > 0;
    }

    fromContract(name: string, allowInterfaces?: boolean): ASTSearch {
        return ASTSearch.fromContract(this.findContract(name), allowInterfaces);
    }

    static from(node: ASTNode | ASTNode[]): ASTSearch {
        return new ASTSearch(coerceArray(node));
    }

    static fromContract(contract: ContractDefinition, allowInterfaces?: boolean): ASTSearch {
        const ancestors = getParentsRecursive(contract, allowInterfaces);
        return new ASTSearch([contract, ...ancestors]);
    }
}

function getParentsRecursive(
    contract: ContractDefinition,
    allowInterfaces?: boolean
): ContractDefinition[] {
    const parents = contract.vInheritanceSpecifiers
        .map((parent) => parent.vBaseType.vReferencedDeclaration as ContractDefinition)
        .filter(
            (parent: ContractDefinition) => allowInterfaces || parent.kind === ContractKind.Contract
        ) as ContractDefinition[];
    for (const parent of parents) {
        const _parents = getParentsRecursive(parent, allowInterfaces);
        _parents.forEach((ancestor) => {
            if (!parents.find((p) => p.name === ancestor.name)) {
                parents.push(ancestor);
            }
        });
    }
    return parents;
}

type WithInvertedProperties<Obj> = Obj & {
    any?: Obj | Obj[];
    not?: Obj | Obj[];
    notAny?: Obj | Obj[];
};

type SolChildSearchType = {
    [K in ASTNodeKind]: { tag: K } & SolSearchAttributes<K>;
};

type SolSearchAttributes<T extends ASTNodeKind> = WithInvertedProperties<
    Partial<StringOrNumberAttributes<ASTNodeMap[T]> & NodeAttributes<ASTNodeMap[T]>> & {
        children?: Array<SolChildSearchType[keyof SolChildSearchType]>;
        ancestors?: Array<SolChildSearchType[keyof SolChildSearchType]>;
    }
>;

const wrapWithSeparators = (props: string[], separator: string, l: string, r: string) => {
    if (!props.length) return "";
    return [l, props.join(separator), r].join("");
};

function combineSearchProperties<T extends ASTNodeKind>({
    ancestors,
    children,
    ...properties
}: SolSearchAttributes<T>) {
    const propertySelectors = Object.keys(properties).map((key) => {
        const value = properties[key as keyof typeof properties];
        if (key[0] !== "@") key = `@${key}`;
        // if (typeof value === "number" || typeof value === "string") {
        return `${key}=${typeof value === "number" ? value : `"${value}"`}`;
        // }
        // selectors.push(`${key}=${typeof value === "number" ? value : `"${value}"`}`)
        // return `${key}=${typeof value === "number" ? value : `"${value}"`}`;
        // return selectors;
    }, []);

    (children || []).forEach(({ tag, ...rest }) => {
        propertySelectors.push(`child::${getSolPropertySelectors(tag, rest)}`);
    });

    (ancestors || []).forEach(({ tag, ...rest }) => {
        propertySelectors.push(`ancestor::${getSolPropertySelectors(tag, rest)}`);
    });
    return propertySelectors;
}

function getSolPropertySelectors<T extends ASTNodeKind>(
    tag: T,
    searchParams: SolSearchAttributes<T> = {}
): string {
    const { not, notAny, any, ...properties } = searchParams;
    const andProps = combineSearchProperties(properties);
    coerceArray(any ?? []).forEach((any) => {
        andProps.push(wrapWithSeparators(combineSearchProperties(any), "or", "(", ")"));
    });

    coerceArray(not ?? []).forEach((not) => {
        andProps.push(wrapWithSeparators(combineSearchProperties(not), "and", "not(", ")"));
    });

    coerceArray(notAny ?? []).forEach((notAny) => {
        andProps.push(wrapWithSeparators(combineSearchProperties(notAny), "or", "not(", ")"));
    });
    const propertySelectors = wrapWithSeparators(andProps.filter(Boolean), "and", "[", "]");
    console.log(`${tag}${propertySelectors}`);
    return `${tag}${propertySelectors}`;
}
