// import { YulStatement } from "./yul_statement";

import { StructuredDocumentation } from "../../meta";
import { YulExpression, YulTypedName } from "../expression";
import { YulASTNode } from "../yul_ast_node";
import { YulStatement } from "./yul_statement";

export class YulVariableDeclaration extends YulStatement {
    readonly type = "YulVariableDeclaration";

    variables: YulTypedName[];

    value?: YulExpression;

    constructor(
        id: number,
        src: string,
        variables: YulTypedName[],
        value?: YulExpression,
        documentation?: string | StructuredDocumentation,
        raw?: any,
        nativeSrc?: string
    ) {
        super(id, src, documentation, raw, nativeSrc);
        this.variables = variables;
        this.value = value;
        this.acceptChildren();
    }

    get children(): readonly YulASTNode[] {
        return this.pickNodes(this.documentation, this.variables, this.value);
    }
}
