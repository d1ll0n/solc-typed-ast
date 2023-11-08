import { coerceArray } from "../../../../misc";
import { ASTContext } from "../../../ast_reader";
import { YulLiteralKind } from "../../../constants";
import { YulExpression, YulFunctionCall, YulIdentifier, YulLiteral } from "../expression";

export function makeYulLiteral(context: ASTContext, value: string | number): YulLiteral {
    const node = new YulLiteral(context.lastId + 1, "0:0:0", YulLiteralKind.Number, value, "");
    context.register(node);
    return node;
}

export function makeYulIdentifier(context: ASTContext, identifier: string): YulIdentifier {
    const node = new YulIdentifier(context.lastId + 1, "0:0:0", identifier);
    context.register(node);
    return node;
}

function getBuiltinFunctionId(context: ASTContext, name: string): YulIdentifier {
    const id = new YulIdentifier(context.lastId + 1, "0:0:0", name);
    context.register(id);
    return id;
}

const isNumeric = <T = any>(value: number | string | T): value is number | string =>
    typeof value === "number" ||
    (typeof value === "string" && !!value.match(/^(0x)?[0-9a-fA-F]+$/));

export function getBuiltInFunctionCall(
    context: ASTContext,
    name: string,
    args: YulExpression[]
): YulFunctionCall {
    const idNode = getBuiltinFunctionId(context, name);
    const fnCall = new YulFunctionCall(context.lastId + 1, "0:0:0", idNode, args);
    context.register(fnCall);
    return fnCall;
}

type MaybeArray<T> = T | T[];

export function coerceExpression<T extends YulExpression>(
    context: ASTContext,
    value: string | number | T
): YulExpression {
    if (isNumeric(value)) {
        return makeYulLiteral(context, value);
    }
    if (typeof value === "string") {
        return makeYulIdentifier(context, value);
    }
    return value;
}

export function coerceExpressionList<T extends YulExpression>(
    context: ASTContext,
    identifier: MaybeArray<string | number | T>
): YulExpression[] {
    return coerceArray(identifier).map((item) =>
        coerceExpression(context, item)
    ) as YulExpression[];
}

export type CastableToYulExpression = YulExpression | string | number;
