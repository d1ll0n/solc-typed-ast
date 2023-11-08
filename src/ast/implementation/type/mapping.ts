import { BaseTypeName } from "./type_name";
import { ASTNode } from "../../ast_node";
import { UserDefinedTypeName } from "./user_defined_type_name";
import { FunctionTypeName } from "./function_type_name";
import { ElementaryTypeName } from "./elementary_type_name";
import { ArrayTypeName } from "./array_type_name";

type TypeName =
    | ArrayTypeName
    | ElementaryTypeName
    | FunctionTypeName
    | Mapping
    | UserDefinedTypeName;

export class Mapping extends BaseTypeName {
    readonly type = "Mapping";

    /**
     * A mapping key type: any built-in **value** type,
     * including `bytes`, `string`, contract and enum types.
     */
    vKeyType: TypeName;

    /**
     * A mapping value type.
     */
    vValueType: TypeName;

    constructor(
        id: number,
        src: string,
        typeString: string,
        keyType: TypeName,
        valueType: TypeName,
        raw?: any
    ) {
        super(id, src, typeString, raw);

        this.vKeyType = keyType;
        this.vValueType = valueType;

        this.acceptChildren();
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.vKeyType, this.vValueType);
    }
}
