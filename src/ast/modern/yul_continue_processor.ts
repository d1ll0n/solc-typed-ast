import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { YulContinue } from "../implementation/yul";
import { ModernNodeProcessor } from "./node_processor";

export class ModernYulContinueProcessor extends ModernNodeProcessor<YulContinue> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof YulContinue> {
        const [id, src] = super.process(reader, config, raw);

        const nativeSrc = raw.nativeSrc as string | undefined;

        return [id, src, undefined, raw, nativeSrc];
    }
}
