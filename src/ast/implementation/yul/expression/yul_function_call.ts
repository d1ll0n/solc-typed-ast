import { ExternalReferenceType } from "../../../constants";
import { YulIdentifier } from "./yul_identifier";
import { YulExpression } from "./yul_expression";
import { YulFunctionDefinition } from "../statement/yul_function_definition";
import { YulASTNode } from "../yul_ast_node";

export class YulFunctionCall extends YulExpression {
    readonly type = "YulFunctionCall";

    /**
     * YulIdentifier that defines the callee
     */
    vFunctionName: YulIdentifier;

    /**
     * Call arguments, e.g array with `1` and `2` expressions in `foo(1, 2)`
     */
    vArguments: YulExpression[];

    constructor(
        id: number,
        src: string,
        functionName: YulIdentifier,
        args: YulExpression[],
        raw?: any
    ) {
        super(id, src, raw);
        this.vFunctionName = functionName;
        this.vArguments = args;

        this.acceptChildren();
    }

    get children(): readonly YulASTNode[] {
        return this.pickNodes(this.vFunctionName, this.vArguments);
    }

    removeChild(node: YulExpression): YulExpression {
        const index = this.vArguments.indexOf(node);

        if (index === -1) {
            throw new Error("Reference node is not a child of current node");
        }

        this.vArguments.splice(index, 1);

        node.parent = undefined;

        return node;
    }

    appendChild(node: YulExpression): YulExpression {
        this.vArguments.push(node);

        node.parent = this;

        return node;
    }

    /**
     * Identifier of the function name, e.g. `sha3(...)`
     */
    get vIdentifier(): string {
        return this.vFunctionName.name;
    }

    /**
     * Solidity builtin or user-defined function
     */
    get vFunctionCallType(): ExternalReferenceType {
        return this.vFunctionName.vIdentifierType;
    }

    /**
     * Called function definition reference
     */
    get vReferencedDeclaration(): YulFunctionDefinition | undefined {
        return this.vFunctionName.vReferencedDeclaration as YulFunctionDefinition;
    }
}
