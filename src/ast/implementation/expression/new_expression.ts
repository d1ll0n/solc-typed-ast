import { ASTNode } from "../../ast_node";
import { TypeName } from "../type/type_name";
import { Expression } from "./expression";

export class NewExpression extends Expression {
	readonly type = "NewExpression";

    /**
     * Type name of the new value
     */
    vTypeName: TypeName;

    constructor(id: number, src: string, typeString: string, typeName: TypeName, raw?: any) {
        super(id, src, typeString, raw);

        this.vTypeName = typeName;

        this.acceptChildren();
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.vTypeName);
    }
}
