import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { YulData } from "../implementation/yul";
import { ModernNodeProcessor } from "./node_processor";

export class ModernYulDataProcessor extends ModernNodeProcessor<YulData> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof YulData> {
        const [id, src] = super.process(reader, config, raw);
        const name = raw.name as string;
        const value = raw.value as string;
        const nativeSrc = raw.nativeSrc as string | undefined;
        return [id, src, name, value, undefined, raw, nativeSrc];
    }
}
