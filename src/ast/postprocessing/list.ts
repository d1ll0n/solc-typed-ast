import { ASTNode } from "../ast_node";
import { ASTNodePostprocessor } from "../ast_reader";
import { BuiltinReferencedDeclarationNormalizer } from "./builtin_referenced_declaration_normalizer";
import { InlineAssemblyPostProcessor } from "./inline_assembly_postprocessor";
import { StructuredDocumentationReconstructingPostprocessor } from "./structured_documentation_reconstruction";

/**
 * Note that order here really matters
 */
export const DefaultNodePostprocessorList: Array<ASTNodePostprocessor<ASTNode>> = [
    new InlineAssemblyPostProcessor(),
    new BuiltinReferencedDeclarationNormalizer(),
    new StructuredDocumentationReconstructingPostprocessor()
];
