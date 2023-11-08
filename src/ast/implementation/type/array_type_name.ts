import { ASTNode } from "../../ast_node";
import { Expression } from "../expression/expression";
import { ElementaryTypeName } from "./elementary_type_name";
import { FunctionTypeName } from "./function_type_name";
import { BaseTypeName } from "./type_name";
import { Mapping } from "./mapping";
import { UserDefinedTypeName } from "./user_defined_type_name";

type TypeName =
    | ArrayTypeName
    | ElementaryTypeName
    | FunctionTypeName
    | Mapping
    | UserDefinedTypeName;

export class ArrayTypeName extends BaseTypeName {
    readonly type = "ArrayTypeName";

    /**
     * Type of array elements
     */
    vBaseType: TypeName;

    /**
     * Length of the array.
     * If array type is unbounded (or dynamic) the value is `undefined`.
     */
    vLength?: Expression;

    constructor(
        id: number,
        src: string,
        typeString: string,
        baseType: TypeName,
        length?: Expression,
        raw?: any
    ) {
        super(id, src, typeString, raw);

        this.vBaseType = baseType;
        this.vLength = length;

        this.acceptChildren();
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.vBaseType, this.vLength);
    }
}
