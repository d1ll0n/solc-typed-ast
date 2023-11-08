import { ASTNode } from "../../ast_node";
import { IdentifierPath } from "../meta/identifier_path";
import { BaseTypeName } from "./type_name";

export class UserDefinedTypeName extends BaseTypeName {
    readonly type = "UserDefinedTypeName";

    /**
     * Name of the defined type
     */
    name?: string;

    /**
     * Id of the referenced declaration node
     */
    referencedDeclaration: number;

    /**
     * An identifier path (since Solidity 0.8.0)
     */
    path?: IdentifierPath;

    constructor(
        id: number,
        src: string,
        typeString: string,
        name: string | undefined,
        referencedDeclaration: number,
        path?: IdentifierPath,
        raw?: any
    ) {
        super(id, src, typeString, raw);

        this.name = name;
        this.referencedDeclaration = referencedDeclaration;
        this.path = path;

        this.acceptChildren();
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.path);
    }

    /**
     * Reference to the declaration
     */
    get vReferencedDeclaration(): ASTNode {
        return this.requiredContext.locate(this.referencedDeclaration);
    }

    set vReferencedDeclaration(value: ASTNode) {
        if (!this.requiredContext.contains(value)) {
            throw new Error(`Node ${value.type}#${value.id} not belongs to a current context`);
        }

        this.referencedDeclaration = value.id;
    }
}
