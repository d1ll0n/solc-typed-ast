import { ASTNode } from "../ast_node";
import { ASTNodePostprocessor, ASTReader } from "../ast_reader";
import { Identifier } from "../implementation/expression/identifier";
import { MemberAccess } from "../implementation/expression/member_access";
import { IdentifierPath } from "../implementation/meta/identifier_path";
import { UserDefinedTypeName } from "../implementation/type/user_defined_type_name";

type SupportedNode = Identifier | MemberAccess | IdentifierPath | UserDefinedTypeName;

export class BuiltinReferencedDeclarationNormalizer implements ASTNodePostprocessor<SupportedNode> {
    process(node: SupportedNode, reader: ASTReader): void {
        if (
            node.referencedDeclaration >= 0 &&
            reader.context.locate(node.referencedDeclaration) === undefined
        ) {
            node.referencedDeclaration = -1;
        }
    }

    isSupportedNode(node: ASTNode): node is SupportedNode {
        return (
            node instanceof Identifier ||
            node instanceof MemberAccess ||
            node instanceof IdentifierPath ||
            node instanceof UserDefinedTypeName
        );
    }
}
