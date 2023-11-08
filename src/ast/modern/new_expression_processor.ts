import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { NewExpression } from "../implementation/expression/new_expression";
import { TypeName } from "../implementation/type";
import { ModernExpressionProcessor } from "./expression_processor";

export class ModernNewExpressionProcessor extends ModernExpressionProcessor<NewExpression> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof NewExpression> {
        const [id, src, typeString] = super.process(reader, config, raw);

        const typeName = reader.convert(raw.typeName, config) as TypeName;

        return [id, src, typeString, typeName, raw];
    }
}
