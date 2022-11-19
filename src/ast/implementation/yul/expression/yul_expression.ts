import { StructuredDocumentation } from "../../meta";
import { ExpressionAccessors, withExpressionAccessors } from "../algebra/arithmetic";
import { YulASTNode } from "../yul_ast_node";

@withExpressionAccessors
export class YulExpression extends YulASTNode {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface YulExpression extends ExpressionAccessors {
    /**
     * Optional documentation appearing above the statement:
     * - Is `undefined` when not specified.
     * - Is type of `string` for compatibility reasons.
     */
    documentation?: string | StructuredDocumentation;
}
