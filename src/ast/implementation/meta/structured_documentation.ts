import { ASTNode } from "../../ast_node";

export class StructuredDocumentation extends ASTNode {
    readonly type = "StructuredDocumentation";
    /**
     * Documentation content string. May contain newline characters.
     */
    text: string;

    useJsDocFormat?: boolean;

    constructor(id: number, src: string, text: string, raw?: any) {
        super(id, src, raw);

        this.text = text;
    }
}
