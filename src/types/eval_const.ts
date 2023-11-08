import Decimal from "decimal.js";
import {
    BinaryOperation,
    Conditional,
    ElementaryTypeNameExpression,
    EtherUnit,
    Expression,
    ExternalReferenceType,
    FunctionCall,
    FunctionCallKind,
    Identifier,
    IndexAccess,
    Literal,
    LiteralKind,
    MemberAccess,
    TimeUnit,
    TupleExpression,
    UnaryOperation,
    VariableDeclaration,
    YulExpression,
    YulFunctionCall,
    YulIdentifier,
    YulLiteral,
    YulLiteralKind,
    YulVariableDeclaration
} from "../ast";
import { LatestCompilerVersion } from "../compile";
import { pp } from "../misc";
import { YulBuiltinFunctionType } from "./ast";
import { yulBuiltins } from "./builtins";
import { yulBinaryBuiltinGroups } from "./infer";
import {
    BytesType,
    FixedBytesType,
    IntType,
    NumericLiteralType,
    StringType,
    TypeNode
} from "./ast";
import { InferType } from "./infer";
import {
    BINARY_OPERATOR_GROUPS,
    SUBDENOMINATION_MULTIPLIERS,
    clampIntToType,
    fixedBytesTypeToIntType
} from "./utils";
/**
 * Tune up precision of decimal values to follow Solidity behavior.
 * Be careful with precision - setting it to large values causes NodeJS to crash.
 *
 * @see https://mikemcl.github.io/decimal.js/#precision
 */
Decimal.set({ precision: 100 });

export type Value = Decimal | boolean | string | bigint | Buffer;

export class EvalError extends Error {
    expr?: Expression | YulExpression | YulVariableDeclaration;

    constructor(msg: string, expr?: Expression | YulExpression | YulVariableDeclaration) {
        super(msg);

        this.expr = expr;
    }
}

export class NonConstantExpressionError extends EvalError {
    constructor(expr: Expression | YulExpression | YulVariableDeclaration) {
        super(`Found non-constant expression ${pp(expr)} during constant evaluation`, expr);
    }
}

function utf8ToHex(s: string): string {
    return Array.from(new TextEncoder().encode(s), (byte) =>
        byte.toString(16).padStart(2, "0")
    ).join("");
}

/**
 * Used for evaluating yul constants, where all values are treated as uint256
 */
function coerceInteger(v: Value): bigint {
    if (typeof v === "bigint") return v;
    // If value is a yul literal string, it's already been converted to a BigInt.
    // If it is any other string, it's an illegal reference to a string constant
    if (typeof v === "string")
        throw Error(
            `coerceInteger called with a string - inline assembly can not reference external string literals`
        );
    if (v instanceof Decimal) return BigInt(v.toFixed());
    return v ? BigInt(1) : BigInt(0);
}

function str(value: Value): string {
    return value instanceof Decimal ? value.toString() : pp(value);
}

export function toDec(v: Value): Decimal {
    if (v instanceof Decimal) {
        return v;
    }

    if (typeof v === "bigint") {
        return new Decimal(v.toString());
    }

    if (typeof v === "string") {
        return new Decimal(v === "" ? 0 : "0x" + Buffer.from(v, "utf-8").toString("hex"));
    }

    if (v instanceof Buffer) {
        return new Decimal(v.length === 0 ? 0 : "0x" + v.toString("hex"));
    }

    throw new Error(`Expected number not ${v}`);
}

export function toInt(v: Value): bigint {
    if (typeof v === "bigint") {
        return v;
    }

    if (v instanceof Decimal && v.isInt()) {
        return BigInt(v.toHex());
    }

    if (typeof v === "string") {
        return v === "" ? 0n : BigInt("0x" + Buffer.from(v, "utf-8").toString("hex"));
    }

    if (v instanceof Buffer) {
        return v.length === 0 ? 0n : BigInt("0x" + v.toString("hex"));
    }

    throw new Error(`Expected integer not ${v}`);
}

function demoteFromDec(d: Decimal): Decimal | bigint {
    return d.isInt() ? BigInt(d.toFixed()) : d;
}

export function castToType(v: Value, fromT: TypeNode | undefined, toT: TypeNode): Value {
    if (typeof v === "bigint") {
        if (toT instanceof IntType) {
            return clampIntToType(v, toT);
        }

        if (toT instanceof FixedBytesType) {
            if (fromT instanceof FixedBytesType && fromT.size < toT.size) {
                return BigInt("0x" + v.toString(16).padEnd(toT.size * 2, "0"));
            }

            return clampIntToType(v, fixedBytesTypeToIntType(toT));
        }
    }

    if (typeof v === "string") {
        if (toT instanceof BytesType) {
            return Buffer.from(v, "utf-8");
        }

        if (toT instanceof FixedBytesType) {
            if (v.length === 0) {
                return 0n;
            }

            const buf = Buffer.from(v, "utf-8");

            if (buf.length < toT.size) {
                return BigInt("0x" + buf.toString("hex").padEnd(toT.size * 2, "0"));
            }

            return BigInt("0x" + buf.slice(0, toT.size).toString("hex"));
        }
    }

    if (v instanceof Buffer) {
        if (toT instanceof StringType) {
            return v.toString("utf-8");
        }

        if (toT instanceof FixedBytesType) {
            if (v.length === 0) {
                return 0n;
            }

            if (v.length < toT.size) {
                return BigInt("0x" + v.toString("hex").padEnd(toT.size * 2, "0"));
            }

            return BigInt("0x" + v.slice(0, toT.size).toString("hex"));
        }
    }

    return v;
}

export function isConstant(
    expr: Expression | VariableDeclaration | YulExpression | YulVariableDeclaration,
    version = LatestCompilerVersion
): boolean {
    if (expr instanceof Literal) {
        return true;
    }

    if (expr instanceof YulLiteral) {
        return true;
    }

    if (expr instanceof UnaryOperation && isConstant(expr.vSubExpression)) {
        return true;
    }

    if (
        expr instanceof VariableDeclaration &&
        expr.constant &&
        expr.vValue &&
        isConstant(expr.vValue)
    ) {
        return true;
    }

    if (expr instanceof YulVariableDeclaration && expr.value && isConstant(expr.value)) {
        return true;
    }

    if (
        expr instanceof BinaryOperation &&
        isConstant(expr.vLeftExpression) &&
        isConstant(expr.vRightExpression)
    ) {
        return true;
    }

    if (
        expr instanceof TupleExpression &&
        !expr.isInlineArray &&
        expr.vOriginalComponents.length === 1 &&
        expr.vOriginalComponents[0] &&
        isConstant(expr.vOriginalComponents[0])
    ) {
        return true;
    }

    /// TODO: We can be more precise here. Conditionals are also constant if
    /// 1) vCondition is constant, and only the selected branch is constant
    /// 2) vCondition is not constant, but both branches are constant and equal (not likely in practice)
    if (
        expr instanceof Conditional &&
        isConstant(expr.vCondition) &&
        isConstant(expr.vTrueExpression) &&
        isConstant(expr.vFalseExpression)
    ) {
        return true;
    }

    if (
        expr instanceof Identifier ||
        expr instanceof MemberAccess ||
        expr instanceof YulIdentifier
    ) {
        return (
            (expr.vReferencedDeclaration instanceof VariableDeclaration ||
                expr.vReferencedDeclaration instanceof YulVariableDeclaration) &&
            isConstant(expr.vReferencedDeclaration)
        );
    }

    if (expr instanceof IndexAccess) {
        return (
            isConstant(expr.vBaseExpression) &&
            expr.vIndexExpression !== undefined &&
            isConstant(expr.vIndexExpression)
        );
    }

    if (
        expr instanceof FunctionCall &&
        expr.kind === FunctionCallKind.TypeConversion &&
        isConstant(expr.vArguments[0])
    ) {
        return true;
    }

    if (
        expr instanceof YulFunctionCall &&
        expr.vFunctionCallType === ExternalReferenceType.Builtin
    ) {
        const builtinFunction = yulBuiltins.getFieldForVersion(expr.vFunctionName.name, version) as
            | YulBuiltinFunctionType
            | undefined;
        if (builtinFunction?.isPure && expr.vArguments.every((arg) => isConstant(arg))) {
            return true;
        }
    }

    return false;
}

function evalYulLiteral(expr: YulLiteral): bigint {
    if (expr.kind === YulLiteralKind.String) {
        return BigInt(`0x${utf8ToHex(expr.value as string).padEnd(64, "0")}`);
    }
    if (expr.kind === YulLiteralKind.Bool) {
        return expr.value === "true" ? BigInt(1) : BigInt(0);
    }
    if (expr.kind === YulLiteralKind.Number) {
        return BigInt(expr.value);
    }

    throw new EvalError(`Unrecognized yul literal kind "${expr.kind}"`, expr);
}

function evalYulBinaryComparison(expr: YulFunctionCall, lVal: bigint, rVal: bigint): Value {
    const op = expr.vFunctionName.name;

    const lDec = toDec(lVal);
    const rDec = toDec(rVal);

    if (op === "lt" || op === "slt") {
        return coerceInteger(lDec.lessThan(rDec));
    }

    if (op === "gt" || op === "sgt") {
        return coerceInteger(lDec.greaterThan(rDec));
    }

    if (op === "eq") {
        return coerceInteger(lDec.eq(rDec));
    }

    throw new EvalError(`Unknown comparison op ${expr.vFunctionName}`, expr);
}

function evalYulBinaryArithmetic(expr: YulFunctionCall, lVal: bigint, rVal: bigint): Value {
    const op = expr.vFunctionName.name;

    const lDec = toDec(lVal);
    const rDec = toDec(rVal);

    let res: Decimal;

    if (op === "add") {
        res = lDec.plus(rDec);
    } else if (op === "sub") {
        res = lDec.minus(rDec);
    } else if (op === "mul") {
        res = lDec.times(rDec);
    } else if (op === "div" || op === "sdiv") {
        res = lDec.div(rDec);
    } else if (op === "mod" || op === "smod") {
        res = lDec.modulo(rDec);
    } else if (op === "exp") {
        res = lDec.pow(rDec);
    } else if (op === "signextend") {
        // @todo Implement `signextend`
        throw new EvalError(`Unimplemented binary op ${expr.vFunctionName}`, expr);
    } else {
        throw new EvalError(`Unknown arithmetic op ${expr.vFunctionName}`, expr);
    }

    return coerceInteger(res);
}

function evalYulBinaryBitwise(expr: YulFunctionCall, lVal: bigint, rVal: bigint): Value {
    const op = expr.vFunctionName.name;

    if (op === "shl") {
        return rVal << lVal;
    }

    // @todo How should sar be handled differently from shr?
    if (op === "shr" || op === "sar") {
        return rVal >> lVal;
    }

    if (op === "or") {
        return lVal | rVal;
    }

    if (op === "and") {
        return lVal & rVal;
    }

    if (op === "xor") {
        return lVal ^ rVal;
    }

    if (op === "byte") {
        const shiftSize = BigInt(248 - Number(lVal) * 8);
        return (rVal >> shiftSize) & BigInt(0xff);
    }

    throw new EvalError(`Unknown bitwise op ${expr.vFunctionName}`, expr);
}

function evalYulUnary(expr: YulFunctionCall, inference: InferType) {
    if (expr.vArguments.length !== 1) {
        throw new EvalError(
            `Expected a single argument in unary builtin function ${pp(expr)}`,
            expr
        );
    }

    const subVal = coerceInteger(evalConstantExpr(expr.vArguments[0], inference));

    if (expr.vFunctionName.name === "iszero") {
        return coerceInteger(subVal === BigInt(0));
    }

    if (expr.vFunctionName.name === "not") {
        return ~subVal;
    }

    throw new EvalError(`NYI unary operator ${expr.vFunctionName}`, expr);
}

function evalYulBinary(expr: YulFunctionCall, inference: InferType) {
    if (expr.vArguments.length !== 2) {
        throw new EvalError(`Expected two arguments in binary builtin function ${pp(expr)}`, expr);
    }

    const [lVal, rVal] = expr.vArguments.map((arg) =>
        coerceInteger(evalConstantExpr(arg, inference))
    );

    const op = expr.vFunctionName.name;

    if (yulBinaryBuiltinGroups.Comparison.includes(op)) {
        return evalYulBinaryComparison(expr, lVal, rVal);
    }

    if (yulBinaryBuiltinGroups.Arithmetic.includes(op)) {
        return evalYulBinaryArithmetic(expr, lVal, rVal);
    }

    if (yulBinaryBuiltinGroups.Bitwise.includes(op)) {
        return evalYulBinaryBitwise(expr, lVal, rVal);
    }

    throw new EvalError(`Unknown binary op ${expr.vFunctionName}`, expr);
}

function evalYulTernary(expr: YulFunctionCall, inference: InferType): Value {
    if (expr.vArguments.length !== 3) {
        throw new EvalError(
            `Expected three arguments in ternary builtin function ${pp(expr)}`,
            expr
        );
    }
    const op = expr.vFunctionName.name;

    const [dec1, dec2, dec3] = expr.vArguments.map((arg) =>
        toDec(coerceInteger(evalConstantExpr(arg, inference)))
    );

    if (op === "mulmod") {
        return coerceInteger(dec1.mul(dec2).mod(dec3));
    }

    if (op === "addmod") {
        return coerceInteger(dec1.add(dec2).mod(dec3));
    }

    throw new EvalError(`Unknown ternary op ${expr.vFunctionName}`, expr);
}

export function evalLiteralImpl(
    kind: LiteralKind,
    value: string,
    subdenomination?: TimeUnit | EtherUnit
): Value {
    if (kind === LiteralKind.Bool) {
        return value === "true";
    }

    if (kind === LiteralKind.HexString) {
        return Buffer.from(value, "hex");
    }

    if (kind === LiteralKind.String || kind === LiteralKind.UnicodeString) {
        return value;
    }

    if (kind === LiteralKind.Number) {
        const dec = new Decimal(value.replaceAll("_", ""));
        const val = dec.isInteger() ? BigInt(dec.toFixed()) : dec;

        if (subdenomination) {
            const multiplier = SUBDENOMINATION_MULTIPLIERS.get(subdenomination);

            if (multiplier === undefined) {
                throw new EvalError(`Unknown denomination ${subdenomination}`);
            }

            if (val instanceof Decimal) {
                return demoteFromDec(val.times(multiplier));
            }

            return val * BigInt(multiplier.toFixed());
        }

        return val;
    }

    throw new EvalError(`Unsupported literal kind "${kind}"`);
}

export function evalUnaryImpl(operator: string, value: Value): Value {
    if (operator === "!") {
        if (typeof value === "boolean") {
            return !value;
        }

        throw new EvalError(`Expected ${str(value)} to be boolean`);
    }

    if (operator === "~") {
        if (typeof value === "bigint") {
            return ~value;
        }

        throw new EvalError(`Expected ${str(value)} to be a bigint`);
    }

    if (operator === "+") {
        if (value instanceof Decimal || typeof value === "bigint") {
            return value;
        }

        throw new EvalError(`Expected ${str(value)} to be a bigint or a decimal`);
    }

    if (operator === "-") {
        if (value instanceof Decimal) {
            return value.negated();
        }

        if (typeof value === "bigint") {
            return -value;
        }

        throw new EvalError(`Expected ${str(value)} to be a bigint or a decimal`);
    }

    throw new EvalError(`Unable to process ${operator}${str(value)}`);
}

export function evalBinaryImpl(operator: string, left: Value, right: Value): Value {
    if (BINARY_OPERATOR_GROUPS.Logical.includes(operator)) {
        if (!(typeof left === "boolean" && typeof right === "boolean")) {
            throw new EvalError(`${operator} expects booleans not ${str(left)} and ${str(right)}`);
        }

        if (operator === "&&") {
            return left && right;
        }

        if (operator === "||") {
            return left || right;
        }

        throw new EvalError(`Unknown logical operator ${operator}`);
    }

    if (BINARY_OPERATOR_GROUPS.Equality.includes(operator)) {
        if (typeof left === "string" && typeof right === "string") {
            throw new EvalError(
                `${operator} not allowed for strings ${str(left)} and ${str(right)}`
            );
        }

        let isEqual: boolean;

        if (typeof left === "boolean" || typeof right === "boolean") {
            isEqual = left === right;
        } else {
            const leftDec = toDec(left);
            const rightDec = toDec(right);

            isEqual = leftDec.equals(rightDec);
        }

        if (operator === "==") {
            return isEqual;
        }

        if (operator === "!=") {
            return !isEqual;
        }

        throw new EvalError(`Unknown equality operator ${operator}`);
    }

    if (BINARY_OPERATOR_GROUPS.Comparison.includes(operator)) {
        if (typeof left === "string" && typeof right === "string") {
            throw new EvalError(
                `${operator} not allowed for strings ${str(left)} and ${str(right)}`
            );
        }

        const leftDec = toDec(left);
        const rightDec = toDec(right);

        if (operator === "<") {
            return leftDec.lessThan(rightDec);
        }

        if (operator === "<=") {
            return leftDec.lessThanOrEqualTo(rightDec);
        }

        if (operator === ">") {
            return leftDec.greaterThan(rightDec);
        }

        if (operator === ">=") {
            return leftDec.greaterThanOrEqualTo(rightDec);
        }

        throw new EvalError(`Unknown comparison operator ${operator}`);
    }

    if (BINARY_OPERATOR_GROUPS.Arithmetic.includes(operator)) {
        const leftDec = toDec(left);
        const rightDec = toDec(right);

        let res: Decimal;

        if (operator === "+") {
            res = leftDec.plus(rightDec);
        } else if (operator === "-") {
            res = leftDec.minus(rightDec);
        } else if (operator === "*") {
            res = leftDec.times(rightDec);
        } else if (operator === "/") {
            res = leftDec.div(rightDec);
        } else if (operator === "%") {
            res = leftDec.modulo(rightDec);
        } else if (operator === "**") {
            res = leftDec.pow(rightDec);
        } else {
            throw new EvalError(`Unknown arithmetic operator ${operator}`);
        }

        return demoteFromDec(res);
    }

    if (BINARY_OPERATOR_GROUPS.Bitwise.includes(operator)) {
        const leftInt = toInt(left);
        const rightInt = toInt(right);

        if (operator === "<<") {
            return leftInt << rightInt;
        }

        if (operator === ">>") {
            return leftInt >> rightInt;
        }

        if (operator === "|") {
            return leftInt | rightInt;
        }

        if (operator === "&") {
            return leftInt & rightInt;
        }

        if (operator === "^") {
            return leftInt ^ rightInt;
        }

        throw new EvalError(`Unknown bitwise operator ${operator}`);
    }

    throw new EvalError(`Unable to process ${str(left)} ${operator} ${str(right)}`);
}

export function evalLiteral(node: Literal): Value {
    let kind = node.kind;

    /**
     * An example:
     *
     * ```solidity
     * contract Test {
     *     bytes4 constant s = "\x75\x32\xea\xac";
     * }
     * ```
     *
     * Note that compiler leaves "null" as string value,
     * so we have to rely on hexadecimal representation instead.
     */
    if ((kind === LiteralKind.String || kind === LiteralKind.UnicodeString) && node.value == null) {
        kind = LiteralKind.HexString;
    }

    const value = kind === LiteralKind.HexString ? node.hexValue : node.value;

    try {
        return evalLiteralImpl(kind, value, node.subdenomination);
    } catch (e: unknown) {
        if (e instanceof EvalError) {
            e.expr = node;
        }

        throw e;
    }
}

export function evalUnary(node: UnaryOperation, inference: InferType): Value {
    try {
        const subT = inference.typeOf(node.vSubExpression);
        const sub = evalConstantExpr(node.vSubExpression, inference);

        if (subT instanceof NumericLiteralType) {
            return evalUnaryImpl(node.operator, sub);
        }

        const resT = inference.typeOfUnaryOperation(node);
        const res = evalUnaryImpl(node.operator, sub);

        return castToType(res, undefined, resT);
    } catch (e: unknown) {
        if (e instanceof EvalError && e.expr === undefined) {
            e.expr = node;
        }

        throw e;
    }
}

export function evalBinary(node: BinaryOperation, inference: InferType): Value {
    try {
        const leftT = inference.typeOf(node.vLeftExpression);
        const rightT = inference.typeOf(node.vRightExpression);

        let left = evalConstantExpr(node.vLeftExpression, inference);
        let right = evalConstantExpr(node.vRightExpression, inference);

        if (leftT instanceof NumericLiteralType && rightT instanceof NumericLiteralType) {
            return evalBinaryImpl(node.operator, left, right);
        }

        if (node.operator !== "**" && node.operator !== ">>" && node.operator !== "<<") {
            const commonT = inference.inferCommonType(leftT, rightT);

            left = castToType(left, leftT, commonT);
            right = castToType(right, rightT, commonT);
        }

        const res = evalBinaryImpl(node.operator, left, right);

        const resT = inference.typeOfBinaryOperation(node);

        return castToType(res, undefined, resT);
    } catch (e: unknown) {
        if (e instanceof EvalError && e.expr === undefined) {
            e.expr = node;
        }

        throw e;
    }
}

export function evalIndexAccess(node: IndexAccess, inference: InferType): Value {
    const base = evalConstantExpr(node.vBaseExpression, inference);
    const index = evalConstantExpr(node.vIndexExpression as Expression, inference);

    if (!(typeof index === "bigint" || index instanceof Decimal)) {
        throw new EvalError(
            `Unexpected non-numeric index into base in expression ${pp(node)}`,
            node
        );
    }

    const plainIndex = index instanceof Decimal ? index.toNumber() : Number(index);

    if (typeof base === "bigint" || base instanceof Decimal) {
        let baseHex = base instanceof Decimal ? base.toHex().slice(2) : base.toString(16);

        if (baseHex.length % 2 !== 0) {
            baseHex = "0" + baseHex;
        }

        const indexInHex = plainIndex * 2;

        if (indexInHex >= baseHex.length) {
            throw new EvalError(
                `Out-of-bounds index access ${indexInHex} (originally ${plainIndex}) to "${baseHex}"`
            );
        }

        return BigInt("0x" + baseHex.slice(indexInHex, indexInHex + 2));
    }

    if (base instanceof Buffer) {
        const res = base.at(plainIndex);

        if (res === undefined) {
            throw new EvalError(
                `Out-of-bounds index access ${plainIndex} to ${base.toString("hex")}`
            );
        }

        return BigInt(res);
    }

    throw new EvalError(`Unable to process ${pp(node)}`, node);
}

export function evalFunctionCall(node: FunctionCall, inference: InferType): Value {
    if (node.kind !== FunctionCallKind.TypeConversion) {
        throw new EvalError(
            `Expected function call to have kind "${FunctionCallKind.TypeConversion}", but got "${node.kind}" instead`,
            node
        );
    }

    if (!(node.vExpression instanceof ElementaryTypeNameExpression)) {
        throw new EvalError(
            `Expected function call expression to be an ${ElementaryTypeNameExpression.name}, but got "${node.type}" instead`,
            node
        );
    }

    const val = evalConstantExpr(node.vArguments[0], inference);
    const fromT = inference.typeOf(node.vArguments[0]);
    const toT = inference.typeOfElementaryTypeNameExpression(node.vExpression).type;

    return castToType(val, fromT, toT);
}

/**
 * Given a constant expression `expr` evaluate it to a concrete `Value`.
 * If `expr` is not constant throw `NonConstantExpressionError`.
 *
 * @todo The order of some operations changed in some version.
 * Current implementation does not yet take it into an account.
 */
export function evalConstantExpr(
    node: Expression | VariableDeclaration | YulExpression | YulVariableDeclaration,
    inference: InferType
): Value {
    if (!isConstant(node)) {
        throw new NonConstantExpressionError(node);
    }

    if (node instanceof Literal) {
        return evalLiteral(node);
    }

    if (node instanceof YulLiteral) {
        return evalYulLiteral(node);
    }

    if (node instanceof UnaryOperation) {
        return evalUnary(node, inference);
    }

    if (node instanceof BinaryOperation) {
        return evalBinary(node, inference);
    }

    if (node instanceof TupleExpression) {
        return evalConstantExpr(node.vOriginalComponents[0] as Expression, inference);
    }

    if (node instanceof Conditional) {
        return evalConstantExpr(node.vCondition, inference)
            ? evalConstantExpr(node.vTrueExpression, inference)
            : evalConstantExpr(node.vFalseExpression, inference);
    }

    if (node instanceof VariableDeclaration) {
        return evalConstantExpr(node.vValue as Expression, inference);
    }

    if (node instanceof Identifier || node instanceof MemberAccess) {
        return evalConstantExpr(
            node.vReferencedDeclaration as Expression | VariableDeclaration,
            inference
        );
    }

    if (node instanceof YulIdentifier) {
        const decl = node.vReferencedDeclaration;
        if (decl instanceof VariableDeclaration) {
            return coerceInteger(evalConstantExpr(decl.vValue as Expression, inference));
        }
        if (decl instanceof YulVariableDeclaration) {
            return coerceInteger(evalConstantExpr(decl.value as YulExpression, inference));
        }
    }

    if (node instanceof IndexAccess) {
        return evalIndexAccess(node, inference);
    }

    if (node instanceof FunctionCall) {
        return evalFunctionCall(node, inference);
    }

    if (
        node instanceof YulFunctionCall &&
        node.vFunctionCallType === ExternalReferenceType.Builtin
    ) {
        const builtinFunction = yulBuiltins.getFieldForVersion(
            node.vFunctionName.name,
            inference.version
        ) as YulBuiltinFunctionType | undefined;
        if (builtinFunction?.isPure) {
            if (builtinFunction.parameters.length === 1) {
                return evalYulUnary(node, inference);
            }
            if (builtinFunction.parameters.length === 2) {
                return evalYulBinary(node, inference);
            }
            if (builtinFunction.parameters.length === 3) {
                return evalYulTernary(node, inference);
            }
        }
    }

    /**
     * Note that from the point of view of the type system constant conditionals and
     * indexing in constant array literals are not considered constant expressions.
     * So for now we don't support them, but we may change that in the future.
     */
    throw new EvalError(`Unable to evaluate constant expression ${pp(node)}`, node);
}
