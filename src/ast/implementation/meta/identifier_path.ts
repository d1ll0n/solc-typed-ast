import { ASTNode } from "../../ast_node";

export class IdentifierPath extends ASTNode {
	readonly type = "IdentifierPath";

    /**
     * A type name
     */
    name: string;

    /**
     * Id of the referenced declaration
     */
    referencedDeclaration: number;

    constructor(id: number, src: string, name: string, referencedDeclaration: number, raw?: any) {
        super(id, src, raw);

        this.name = name;
        this.referencedDeclaration = referencedDeclaration;
    }

    /**
     * Attribute to access the converted referenced declaration.
     *
     * Is `undefined` when this is a Solidity internal identifier.
     */
    get vReferencedDeclaration(): ASTNode | undefined {
        return this.requiredContext.locate(this.referencedDeclaration);
    }

    set vReferencedDeclaration(value: ASTNode | undefined) {
        if (value === undefined) {
            this.referencedDeclaration = -1;
        } else {
            if (!this.requiredContext.contains(value)) {
                throw new Error(`Node ${value.type}#${value.id} not belongs to a current context`);
            }

            this.referencedDeclaration = value.id;
        }
    }
}
