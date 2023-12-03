import { StructuredDocumentation } from "../../meta";
import { YulASTNode } from "../yul_ast_node";
import { YulStatement } from "./yul_statement";

export class YulData extends YulStatement {
    readonly type = "YulData";

    name: string;
    value: string;

    constructor(
        id: number,
        src: string,
        name: string,
        value: string,
        documentation?: string | StructuredDocumentation,
        raw?: any,
        nativeSrc?: string
    ) {
        super(id, src, documentation, raw, nativeSrc);
        this.name = name;
        this.value = value;
        this.acceptChildren();
    }

    get children(): readonly YulASTNode[] {
        return this.pickNodes(this.documentation);
    }
}
