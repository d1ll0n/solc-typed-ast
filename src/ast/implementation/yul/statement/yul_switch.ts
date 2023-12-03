import { StructuredDocumentation } from "../../meta";
import { YulExpression } from "../expression";
import { YulASTNode } from "../yul_ast_node";
import { YulCase } from "./yul_case";
import { YulStatement } from "./yul_statement";

export class YulSwitch extends YulStatement {
    readonly type = "YulSwitch";

    vExpression: YulExpression;

    vCases: YulCase[];

    constructor(
        id: number,
        src: string,
        expression: YulExpression,
        cases: YulCase[],
        documentation?: string | StructuredDocumentation,
        raw?: any,
        nativeSrc?: string
    ) {
        super(id, src, documentation, raw, nativeSrc);
        this.vExpression = expression;
        this.vCases = cases;
        this.acceptChildren();
    }

    get children(): readonly YulASTNode[] {
        return this.pickNodes(this.documentation, this.vExpression, this.vCases);
    }
}
