/* eslint-disable no-prototype-builtins */
import { MathNode } from "mathjs";
import { YulExpression, YulFunctionCall } from "../expression";
import {
    expressionEq,
    expressionGt,
    expressionGte,
    expressionLt,
    expressionLte,
    simplifyYulExpression,
    yulToMathNode
} from "./algebra";
import { getBuiltInFunctionCall, coerceExpressionList } from "./yul_builders";

export type CastableToYulExpression = YulExpression | string | number;

export const isNumeric = <T = any>(value: number | string | T): value is number | string =>
    typeof value === "number" ||
    (typeof value === "string" && !!value.match(/^(0x)?[0-9a-fA-F]+$/));

const BaseArithmeticPrototypes = {
    add: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "add", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    mul: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "mul", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    sub: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "sub", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    div: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "div", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    sdiv: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "sdiv", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    mod: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "mod", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    smod: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "smod", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    addmod: function (this: YulExpression, y: CastableToYulExpression, m: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "addmod", [
            this,
            ...coerceExpressionList(this.requiredContext, [y, m])
        ]);
    },
    mulmod: function (this: YulExpression, y: CastableToYulExpression, m: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "mulmod", [
            this,
            ...coerceExpressionList(this.requiredContext, [y, m])
        ]);
    },
    exp: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "exp", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    signextend: function (this: YulExpression, x: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "signextend", [
            this,
            ...coerceExpressionList(this.requiredContext, [x])
        ]);
    },
    lt: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "lt", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    gt: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "gt", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    slt: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "slt", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    sgt: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "sgt", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    eq: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "eq", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    iszero: function (this: YulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "iszero", [this]);
    },
    and: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "and", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    or: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "or", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    xor: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "xor", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    not: function (this: YulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "not", [this]);
    },
    byte: function (this: YulExpression, x: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "byte", [
            this,
            ...coerceExpressionList(this.requiredContext, [x])
        ]);
    },
    shl: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "shl", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    shr: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "shr", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    },
    sar: function (this: YulExpression, y: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "sar", [
            this,
            ...coerceExpressionList(this.requiredContext, [y])
        ]);
    }
};

const ArithmeticPrototypes = Object.entries(BaseArithmeticPrototypes).reduce((proto, [key, fn]) => {
    proto[key] = fn;
    proto[`${key}Simplify`] = function (this: YulExpression, ...args: any[]) {
        return simplifyYulExpression((this as any)[key](...args));
    };
    return proto;
}, {} as any);

const DataPrototypes = {
    calldataload: function (this: YulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "calldataload", [this]);
    },
    calldatasize: function (this: YulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "calldatasize", [this]);
    },
    calldatacopy: function (
        this: YulExpression,
        src: CastableToYulExpression,
        size: CastableToYulExpression
    ) {
        return getBuiltInFunctionCall(this.requiredContext, "calldatacopy", [
            this,
            ...coerceExpressionList(this.requiredContext, [src, size])
        ]);
    },
    returndatasize: function (this: YulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "returndatasize", [this]);
    },
    returndatacopy: function (
        this: YulExpression,
        src: CastableToYulExpression,
        size: CastableToYulExpression
    ) {
        return getBuiltInFunctionCall(this.requiredContext, "returndatacopy", [
            this,
            ...coerceExpressionList(this.requiredContext, [src, size])
        ]);
    },
    mload: function (this: YulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "mload", [this]);
    },
    mstore: function (this: YulExpression, value: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "mstore", [
            this,
            ...coerceExpressionList(this.requiredContext, [value])
        ]);
    },
    mstore8: function (this: YulExpression, value: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "mstore8", [
            this,
            ...coerceExpressionList(this.requiredContext, [value])
        ]);
    },
    sload: function (this: YulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "sload", [this]);
    },
    sstore: function (this: YulExpression, value: CastableToYulExpression) {
        return getBuiltInFunctionCall(this.requiredContext, "sstore", [
            this,
            ...coerceExpressionList(this.requiredContext, [value])
        ]);
    }
};

const ExpressionPrototypes = {
    ...DataPrototypes,
    ...ArithmeticPrototypes,
    simplify: function (this: YulExpression) {
        return simplifyYulExpression(this);
    },
    toMathNode: function (this: YulExpression) {
        return yulToMathNode(this);
    },
    isGt: function (this: YulExpression, node: YulExpression) {
        return expressionGt(this, node);
    },
    isGte: function (this: YulExpression, node: YulExpression) {
        return expressionGte(this, node);
    },
    isLt: function (this: YulExpression, node: YulExpression) {
        return expressionLt(this, node);
    },
    isLte: function (this: YulExpression, node: YulExpression) {
        return expressionLte(this, node);
    },
    isEq: function (this: YulExpression, node: YulExpression) {
        return expressionEq(this, node);
    }
};

type BaseArithmeticAccessors = {
    smartAdd(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    smartMul(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    add(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    mul(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    sub(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    div(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    sdiv(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    mod(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    smod(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    addmod(
        this: YulExpression,
        y: CastableToYulExpression,
        m: CastableToYulExpression
    ): YulFunctionCall;
    mulmod(
        this: YulExpression,
        y: CastableToYulExpression,
        m: CastableToYulExpression
    ): YulFunctionCall;
    exp(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    signextend(this: YulExpression, x: CastableToYulExpression): YulFunctionCall;
    lt(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    gt(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    slt(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    sgt(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    eq(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    iszero(this: YulExpression): YulFunctionCall;
    and(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    or(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    xor(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    not(this: YulExpression): YulFunctionCall;
    byte(this: YulExpression, x: CastableToYulExpression): YulFunctionCall;
    shl(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    shr(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
    sar(this: YulExpression, y: CastableToYulExpression): YulFunctionCall;
};

type ArithmeticAccessors = BaseArithmeticAccessors & {
    [K in keyof BaseArithmeticAccessors as `${K}Simplify`]: BaseArithmeticAccessors[K];
};

interface DataAccessors {
    calldataload(this: YulExpression): YulFunctionCall;
    calldatasize(this: YulExpression): YulFunctionCall;
    calldatacopy(
        this: YulExpression,
        src: CastableToYulExpression,
        size: CastableToYulExpression
    ): YulFunctionCall;
    returndatasize(this: YulExpression): YulFunctionCall;
    returndatacopy(
        this: YulExpression,
        src: CastableToYulExpression,
        size: CastableToYulExpression
    ): YulFunctionCall;
    mload(this: YulExpression): YulFunctionCall;
    mstore(this: YulExpression, value: CastableToYulExpression): YulFunctionCall;
    mstore8(this: YulExpression, value: CastableToYulExpression): YulFunctionCall;
    sload(this: YulExpression): YulFunctionCall;
    sstore(this: YulExpression, value: CastableToYulExpression): YulFunctionCall;
}

export interface ExpressionAccessors extends ArithmeticAccessors, DataAccessors {
    simplify: () => YulExpression;
    toMathNode: () => MathNode;
    isGt: (node: YulExpression) => 1 | 0 | -1;
    isGte: (node: YulExpression) => 1 | 0 | -1;
    isLt: (node: YulExpression) => 1 | 0 | -1;
    isLte: (node: YulExpression) => 1 | 0 | -1;
    isEq: (node: YulExpression) => 1 | 0 | -1;
}

export const withExpressionAccessors = <
    OldClass,
    TFunction extends { new (...args: any[]): OldClass }
>(
    Class: TFunction & { new (...args: any[]): OldClass }
): TFunction & {
    new (...args: any[]): OldClass & ExpressionAccessors;
} => {
    Reflect.ownKeys(ExpressionPrototypes).forEach((key, i) => {
        // const newPrototype: OldClass & ExpressionAccessors = Class.prototype;
        // Reflect.setPrototypeOf(Class, newPrototype);
        if (key !== "constructor") {
            if (Class.prototype.hasOwnProperty(key))
                console.warn(`Warning: mixin property overrides ${Class.name}.${String(key)}`);
            Object.defineProperty(
                Class.prototype,
                key,
                Object.getOwnPropertyDescriptor(ExpressionPrototypes, key) as PropertyDescriptor
            );
        }
    });
    return Class as TFunction & {
        new (...args: any[]): OldClass & ExpressionAccessors;
    };
};
