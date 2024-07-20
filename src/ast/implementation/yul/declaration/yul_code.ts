import { StructuredDocumentation } from "../../meta";
import { YulASTNode } from "../yul_ast_node";
import { YulBlock } from "../statement/yul_block";

export class YulCode extends YulASTNode {
    readonly type = "YulCode";

    /**
     * Optional documentation appearing above the statement:
     * - Is `undefined` when not specified.
     * - Is type of `string` for compatibility reasons.
     */
    documentation?: string | StructuredDocumentation;

    vBlock: YulBlock;

    constructor(
        id: number,
        src: string,
        block: YulBlock,
        documentation?: string | StructuredDocumentation,
        raw?: any,
        nativeSrc?: string
    ) {
        super(id, src, raw, nativeSrc);
        this.documentation = documentation;
        this.vBlock = block;
        this.acceptChildren();
    }

    get children(): readonly YulASTNode[] {
        return this.pickNodes(this.documentation, this.vBlock);
    }
}
