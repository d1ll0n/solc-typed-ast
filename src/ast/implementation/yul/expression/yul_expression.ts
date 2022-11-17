import { ExpressionAccessors, withExpressionAccessors } from "../algebra/arithmetic";
import { YulASTNode } from "../yul_ast_node";

@withExpressionAccessors
export class YulExpression extends YulASTNode {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface YulExpression extends ExpressionAccessors {}
