import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { TypeName, TypeNameConstructor } from "../implementation/type";
import { LegacyNodeProcessor } from "./node_processor";

export class LegacyTypeNameProcessor<T extends TypeName> extends LegacyNodeProcessor<T> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<TypeNameConstructor<T>> {
        const [id, src] = super.process(reader, config, raw);

        const typeString: string = raw.attributes.type;

        return [id, src, typeString, raw];
    }
}
