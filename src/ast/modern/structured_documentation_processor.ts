import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { extractDocumentationText } from "../documentation";
import { StructuredDocumentation } from "../implementation/meta/structured_documentation";
import { ModernNodeProcessor } from "./node_processor";

export class ModernStructuredDocumentationProcessor extends ModernNodeProcessor<StructuredDocumentation> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof StructuredDocumentation> {
        const [id, src] = super.process(reader, config, raw);

        const text: string = extractDocumentationText(raw.text);

        return [id, src, text, raw];
    }
}
