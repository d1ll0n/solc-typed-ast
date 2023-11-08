import { ASTNode } from "../../ast_node";
import { FunctionCall } from "../expression/function_call";
import { StructuredDocumentation } from "../meta";
import { Statement } from "./statement";
import { TryCatchClause } from "./try_catch_clause";

export class TryStatement extends Statement {
	readonly type = "TryStatement";
    /**
     * Contract creation call expression or external function call expression
     */
    vExternalCall: FunctionCall;

    /**
     * An array of defined `catch` clauses
     */
    vClauses: TryCatchClause[];

    constructor(
        id: number,
        src: string,
        externalCall: FunctionCall,
        clauses: TryCatchClause[],
        documentation?: string | StructuredDocumentation,
        raw?: any
    ) {
        super(id, src, documentation, raw);

        this.vExternalCall = externalCall;
        this.vClauses = clauses;

        this.acceptChildren();
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.documentation, this.vExternalCall, this.vClauses);
    }
}
