import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { YulAssignment, YulExpression, YulIdentifier } from "../implementation/yul";
import { ModernNodeProcessor } from "./node_processor";

export class ModernYulAssignmentProcessor extends ModernNodeProcessor<YulAssignment> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof YulAssignment> {
        const [id, src] = super.process(reader, config, raw);

        const variableNames = reader.convertArray(raw.variableNames, config) as YulIdentifier[];
        const value = reader.convert(raw.value, config) as YulExpression;
        const nativeSrc = raw.nativeSrc as string | undefined;

        return [id, src, variableNames, value, undefined, raw, nativeSrc];
    }
}
