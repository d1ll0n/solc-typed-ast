import { ASTNode } from "../../../ast_node";
import { ExternalReferenceType } from "../../../constants";
import { YulExpression } from "./yul_expression";

export class YulIdentifier extends YulExpression {
    readonly type = "YulIdentifier";

    /**
     * Name of the identifier
     */
    name: string;

    /**
     * Id of the referenced declaration
     */
    referencedDeclaration: number;

    constructor(
        id: number,
        src: string,
        name: string,
        referencedDeclaration?: number | ASTNode,
        raw?: any
    ) {
        super(id, src, raw);

        this.name = name;
        this.referencedDeclaration = referencedDeclaration
            ? typeof referencedDeclaration === "number"
                ? referencedDeclaration
                : referencedDeclaration.id
            : -1;
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

    /**
     * Solidity builtin or user-defined reference
     */
    get vIdentifierType(): ExternalReferenceType {
        return this.vReferencedDeclaration
            ? ExternalReferenceType.UserDefined
            : ExternalReferenceType.Builtin;
    }
}
