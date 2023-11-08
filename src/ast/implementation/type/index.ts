import { isInstanceOf } from "../../../misc";
import { ASTNode } from "../../ast_node";
import { ArrayTypeName } from "./array_type_name";
import { ElementaryTypeName } from "./elementary_type_name";
import { FunctionTypeName } from "./function_type_name";
import { Mapping } from "./mapping";
import { UserDefinedTypeName } from "./user_defined_type_name";

export type TypeName =
    | ArrayTypeName
    | ElementaryTypeName
    | FunctionTypeName
    | Mapping
    | UserDefinedTypeName;

export { ArrayTypeName, ElementaryTypeName, FunctionTypeName, Mapping, UserDefinedTypeName };

export * from "./type_name";

export const isTypeName = (node: ASTNode): node is TypeName =>
    isInstanceOf(
        node,
        ArrayTypeName,
        ElementaryTypeName,
        FunctionTypeName,
        Mapping,
        UserDefinedTypeName
    );
