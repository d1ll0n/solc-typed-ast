import { ASTNode } from "../../ast_node";
import { Expression } from "../expression/expression";
import { StructuredDocumentation } from "../meta";
import { Statement } from "./statement";

export class WhileStatement extends Statement {
    readonly type = "WhileStatement";

    /**
     * Continuation condition, e.g. `x < 10` in `while (x < 10) { ... }`
     */
    vCondition: Expression;

    /**
     * Statement that gets executed if the condition is true
     */
    vBody: Statement;

    constructor(
        id: number,
        src: string,
        condition: Expression,
        body: Statement,
        documentation?: string | StructuredDocumentation,
        raw?: any
    ) {
        super(id, src, documentation, raw);

        this.vCondition = condition;
        this.vBody = body;

        this.acceptChildren();
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.documentation, this.vCondition, this.vBody);
    }
}
