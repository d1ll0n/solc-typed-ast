import { ASTNode, ASTNodeConstructor } from "../ast_node";
import { ASTNodeProcessor, ASTReader, ASTReaderConfiguration } from "../ast_reader";

export class ModernNodeProcessor<T extends ASTNode> implements ASTNodeProcessor<T> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<ASTNodeConstructor<T>> {
        const id = raw.id ?? reader.context.nextId;
        const src = raw.src ?? "-1;-1;-1";
        return [id, src, undefined, raw];
    }
}
