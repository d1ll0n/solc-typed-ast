import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { StructuredDocumentation } from "../implementation";
import { EnumDefinition } from "../implementation/declaration/enum_definition";
import { EnumValue } from "../implementation/declaration/enum_value";
import { ModernNodeProcessor } from "./node_processor";

export class ModernEnumDefinitionProcessor extends ModernNodeProcessor<EnumDefinition> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof EnumDefinition> {
        const [id, src] = super.process(reader, config, raw);

        const name: string = raw.name;
        const nameLocation: string | undefined = raw.nameLocation;

        const members = reader.convertArray(raw.members, config) as EnumValue[];

        let documentation: string | StructuredDocumentation | undefined;

        if (raw.documentation) {
            documentation =
                typeof raw.documentation === "string"
                    ? raw.documentation
                    : reader.convert(raw.documentation, config);
        }

        return [id, src, name, members, documentation, nameLocation, raw];
    }
}
