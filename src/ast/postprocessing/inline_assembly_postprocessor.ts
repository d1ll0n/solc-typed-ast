import { ASTNode } from "../ast_node";
import { ASTNodePostprocessor, ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { InlineAssembly, YulBlock } from "../implementation";

export class InlineAssemblyPostProcessor implements ASTNodePostprocessor<InlineAssembly> {
    process(node: InlineAssembly, reader: ASTReader, config: ASTReaderConfiguration): void {
        node.yul = reader.convert(node.raw!.AST, config) as YulBlock;
        node.acceptChildren();
    }

    isSupportedNode(node: ASTNode): node is InlineAssembly {
        return node instanceof InlineAssembly && node.raw?.AST;
    }
}
