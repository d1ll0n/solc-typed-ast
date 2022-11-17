import { expect } from "expect";
import {
    ASTNodeFactory,
    evalConstantExpr,
    Value,
    YulExpression,
    YulLiteralKind
} from "../../../src";
import {
    expressionEq,
    simplifyYulExpression
} from "../../../src/ast/implementation/yul/algebra/algebra";

const cases: Array<
    [
        string,
        (
            factory: ASTNodeFactory
        ) => [YulExpression, Value] | [YulExpression, YulExpression, true | false | undefined]
    ]
> = [
    [
        "10 + 10 -> 20",
        (factory: ASTNodeFactory) => {
            const a = factory.makeYulLiteral(YulLiteralKind.Number, 10, "");
            const b = factory.makeYulLiteral(YulLiteralKind.Number, 10, "");
            const expr = a.add(b);
            return [expr, BigInt(20)];
        }
    ],
    [
        "((10+1+1)*3)/2 -> 18",
        (factory: ASTNodeFactory) => {
            const a = factory.makeYulLiteral(YulLiteralKind.Number, 10, "");
            const expr = a.add(1).add(1).mul(3).div(2);
            return [expr, BigInt(18)];
        }
    ],
    [
        "0*(a+b) === 0 -> true",
        (factory: ASTNodeFactory) => {
            const a = factory.makeYulIdentifier("a");
            const b = factory.makeYulIdentifier("b");
            const expr = a.mul(b).mul(0);
            const zero = factory.makeYulLiteral(YulLiteralKind.Number, 0, "");
            return [expr, zero, true];
        }
    ],
    [
        "0*(a+b) === 1 -> false",
        (factory: ASTNodeFactory) => {
            const a = factory.makeYulIdentifier("a");
            const b = factory.makeYulIdentifier("b");
            const expr = a.mul(b).mul(0);
            const one = factory.makeYulLiteral(YulLiteralKind.Number, 1, "");
            return [expr, one, false];
        }
    ],
    [
        "(a+b) === c -> undefined",
        (factory: ASTNodeFactory) => {
            const a = factory.makeYulIdentifier("a");
            const b = factory.makeYulIdentifier("b");
            const expr = a.mul(b);
            const c = factory.makeYulIdentifier("c");
            return [expr, c, undefined];
        }
    ],
    [
        "addSimplify(a+10, 20) -> a+30",
        (factory: ASTNodeFactory) => {
            const a = factory.makeYulIdentifier("a").add(10);
            const b = factory.makeYulLiteral(YulLiteralKind.Number, "20", "");
            const expr = a.addSimplify(b);
            const c = factory.makeYulIdentifier("a").add(30);
            return [expr, c, true];
        }
    ]
];
describe("Algebra on constant Yul expressions", () => {
    let factory: ASTNodeFactory;

    before(() => {
        factory = new ASTNodeFactory();
    });

    for (const [name, exprBuilder] of cases) {
        it(`${name}`, () => {
            const [expr, result, equality] = exprBuilder(factory);
            if (result instanceof YulExpression) {
                expect(expressionEq(expr, result)).toEqual(
                    equality === true ? 1 : equality === false ? -1 : 0
                );
            } else {
                expect(evalConstantExpr(simplifyYulExpression(expr))).toEqual(result);
            }
        });
    }
});
