/* eslint-disable no-prototype-builtins */
// import { BuiltinFunctionIds } from "../builtin";
import {
    ConstantNode,
    FunctionNode,
    MathNode,
    OperatorNode,
    parse,
    simplify,
    SymbolNode
} from "mathjs";
import { inspect } from "util";
import { getBuiltInFunctionCall, coerceExpression } from "./yul_builders";
import {
    YulExpression,
    YulFunctionCall,
    YulIdentifier,
    YulLiteral,
    YulTypedName
} from "../expression";
import { ASTContext } from "../../../ast_reader";
import { makeYulLiteral, makeYulIdentifier } from "./yul_builders";
import { evalConstantExpr, isConstant } from "../../../../types/eval_const";

export type CastableToYulExpression = YulExpression | string | number;

const operatorTemplates: Record<string, string> = {
    add: `($0 + $1)`,
    mul: `($0 * $1)`,
    sub: `($0 - $1)`,
    div: `($0 / $1)`,
    sdiv: `($0 / $1)`,
    mod: `($0 % $1)`,
    smod: `($0 % $1)`,
    addmod: `(($0 + $1) % $2)`,
    mulmod: `(($0 * $1) % $2)`,
    exp: `($0^$1)`,
    and: `($0 & $1)`,
    or: `($0 | $1)`,
    iszero: `($0 == 0)`,
    eq: `($0 == $1)`,
    gt: `($0 > $1)`,
    lt: `($0 < $1)`,
    shl: `($1 << $0)`,
    shr: `($1 >> $0)`
};

export function yulToStringExpression(a: YulExpression): string {
    if (a instanceof YulFunctionCall) {
        let formatString = operatorTemplates[a.vFunctionName.name];
        const values = a.vArguments.map((arg) => yulToStringExpression(arg as YulExpression));
        if (!formatString) {
            return `${a.vFunctionName}(${values.join(", ")})`;
        }
        values.forEach((value, i) => {
            formatString = formatString.replace(`$${i}`, value);
        });
        return formatString;
    }
    if (a instanceof YulIdentifier) {
        return isConstant(a) ? evalConstantExpr(a).toString() : a.name;
    }
    if (a instanceof YulTypedName) return a.name;
    if (a instanceof YulLiteral) return evalConstantExpr(a)?.toString();
    throw Error(`Unrecognized yul expression ${a}`);
}

const OperationLookup: Record<string, string> = {
    add: "add",
    multiply: "mul",
    subtract: "sub",
    divide: "div",
    mod: "mod",
    pow: "exp",
    bitAnd: "and",
    bitOr: "or",
    equal: "eq",
    larger: "gt",
    smaller: "lt",
    leftShift: "shl",
    rightArithShift: "shr"
};

const MathNodeConverters: Record<string, (ctx: ASTContext, node: any) => YulExpression> = {
    SymbolNode: (ctx: ASTContext, node: SymbolNode) => makeYulIdentifier(ctx, node.name),
    ConstantNode: (ctx: ASTContext, node: ConstantNode) => makeYulLiteral(ctx, node.value),
    OperatorNode: (ctx: ASTContext, node: OperatorNode) => {
        const name = (node.fn as SymbolNode).toString();
        const yulName = OperationLookup[name];
        if (!yulName) {
            console.log(inspect(node, { depth: 7 }));
            throw Error(`${node.fn} operation not recognized as Yul function`);
        }
        return getBuiltInFunctionCall(
            ctx,
            yulName,
            node.args.map((arg) => mathNodeToYul(ctx, arg))
        );
    },
    FunctionNode: (ctx: ASTContext, node: FunctionNode) => {
        const name = (node.fn as SymbolNode).toString();
        return getBuiltInFunctionCall(
            ctx,
            name,
            node.args.map((arg) => mathNodeToYul(ctx, arg))
        );
        // return new YulFunctionCall(makeYulIdentifier(name), node.args.map(mathNodeToYul));
    }
};

export function mathNodeToYul(ctx: ASTContext, node: MathNode): YulExpression {
    const converter = MathNodeConverters[node.type];
    if (!converter) {
        throw Error(`Unimplemented MathNode ${node.type}`);
    }
    return converter(ctx, node);
}

export function mathStringToYul(ctx: ASTContext, str: string): YulExpression {
    const mathNode = parse(str);
    return mathNodeToYul(ctx, mathNode);
}

export function yulToMathNode(node: YulExpression): MathNode {
    return parse(yulToStringExpression(node));
}

export function simplifyYulExpression(node: YulExpression): YulExpression {
    const ctx = node.requiredContext;
    const str = yulToStringExpression(node);
    return mathNodeToYul(ctx, simplify(str));
}

/**
 * Determine whether expression `a` is greater than expression `b`
 * @returns `0` if it can not be determined;
 * @returns `1` if `a` is definitely greater than `b`;
 * @returns `-1` if `a` is definitely not greater than `b`;
 */
export function expressionGt(a: YulExpression, b: YulExpression): 0 | 1 | -1 {
    const gtNode = simplify(yulToMathNode(a.sub(b).gt(0)));
    if (gtNode.type === "ConstantNode") {
        return gtNode.equals(parse("1")) ? 1 : -1;
    }
    return 0;
}

/**
 * Determine whether expression `a` is greater than or equal to expression `b`
 * @returns `0` if it can not be determined;
 * @returns `1` if `a` is definitely greater than or equal to `b`;
 * @returns `-1` if `a` is definitely not greater than or equal to `b`;
 */
export function expressionGte(a: YulExpression, b: YulExpression): 0 | 1 | -1 {
    const gtNode = simplify(yulToMathNode(a.sub(b).gt(-1)));
    if (gtNode.type === "ConstantNode") {
        return gtNode.equals(parse("1")) ? 1 : -1;
    }
    return 0;
}

/**
 * Determine whether expression `a` is less than expression `b`
 * @returns `0` if it can not be determined;
 * @returns `1` if `a` is definitely less than `b`;
 * @returns `-1` if `a` is definitely not less than `b`;
 */
export function expressionLt(a: YulExpression, b: YulExpression): 0 | 1 | -1 {
    const ltNode = simplify(yulToMathNode(a.sub(b).lt(0)));
    if (ltNode.type === "ConstantNode") {
        return ltNode.equals(parse("1")) ? 1 : -1;
    }
    return 0;
}

/**
 * Determine whether expression `a` is less than or equal to expression `b`
 * @returns `0` if it can not be determined;
 * @returns `1` if `a` is definitely less than or equal to `b`;
 * @returns `-1` if `a` is definitely not less than or equal to `b`;
 */
export function expressionLte(a: YulExpression, b: YulExpression): 0 | 1 | -1 {
    const gtNode = simplify(yulToMathNode(a.sub(b).lt(1)));
    if (gtNode.type === "ConstantNode") {
        return gtNode.equals(parse("1")) ? 1 : -1;
    }
    return 0;
}

/**
 * Determine whether expression `a` is equivalent to expression `b`
 * @returns `0` if it can not be determined;
 * @returns `1` if `a` is definitely equal to `b`;
 * @returns `-1` if `a` is definitely not equal to `b`;
 */
export function expressionEq(a: YulExpression, b: YulExpression): 0 | 1 | -1 {
    const ltNode = simplify(yulToMathNode(a.sub(b).eq(0)));
    if (ltNode.type === "ConstantNode") {
        return ltNode.equals(parse("1")) ? 1 : -1;
    }
    return 0;
}

export function smartAdd(a: YulExpression, _b: CastableToYulExpression): YulExpression {
    const b = coerceExpression(a.requiredContext, _b);
    return simplifyYulExpression(a.add(b as any));
}

export function smartMul(a: YulExpression, _b: CastableToYulExpression): YulExpression {
    const b = coerceExpression(a.requiredContext, _b);
    return simplifyYulExpression(a.mul(b as any));
}
