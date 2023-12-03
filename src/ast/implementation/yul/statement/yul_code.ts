import { StructuredDocumentation } from "../../meta";
import { YulASTNode } from "../yul_ast_node";
import { YulBlock } from "./yul_block";
import { YulStatement } from "./yul_statement";

export class YulCode extends YulStatement {
    readonly type = "YulCode";

    vBlock: YulBlock;

    constructor(
        id: number,
        src: string,
        block: YulBlock,
        documentation?: string | StructuredDocumentation,
        raw?: any,
        nativeSrc?: string
    ) {
        super(id, src, documentation, raw, nativeSrc);
        this.vBlock = block;
        this.acceptChildren();
    }

    get children(): readonly YulASTNode[] {
        return this.pickNodes(this.documentation, this.vBlock);
    }
}
