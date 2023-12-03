import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { YulCode, YulData, YulObject } from "../implementation/yul";
import { ModernNodeProcessor } from "./node_processor";

export class ModernYulObjectProcessor extends ModernNodeProcessor<YulObject> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof YulObject> {
        const [id, src] = super.process(reader, config, raw);
        const name = raw.name as string;
        const code = reader.convert(raw.code, config) as YulCode;
        const subObjects = reader.convertArray(raw.subObjects, config) as Array<
            YulObject | YulData
        >;
        const nativeSrc = raw.nativeSrc as string | undefined;
        return [id, src, name, code, subObjects, undefined, raw, nativeSrc];
    }
}
