import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { YulBlock, YulCode } from "../implementation/yul";
import { ModernNodeProcessor } from "./node_processor";

export class ModernYulCodeProcessor extends ModernNodeProcessor<YulCode> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof YulCode> {
        const [id, src] = super.process(reader, config, raw);
        const block = reader.convert(raw.block, config) as YulBlock;
        const nativeSrc = raw.nativeSrc as string | undefined;
        return [id, src, block, undefined, raw, nativeSrc];
    }
}
