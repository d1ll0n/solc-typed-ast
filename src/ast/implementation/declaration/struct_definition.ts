import { getFQDefName } from "../../..";
import { ASTNode, ASTNodeWithChildren } from "../../ast_node";
import { SourceUnit } from "../meta/source_unit";
import { ContractDefinition } from "./contract_definition";
import { VariableDeclaration } from "./variable_declaration";
import { StructuredDocumentation } from "../meta/structured_documentation";
export class StructDefinition extends ASTNodeWithChildren<VariableDeclaration> {
    readonly type = "StructDefinition";

    // docString?: string;

    documentation?: string | StructuredDocumentation;

    /**
     * The name of the struct
     */
    name: string;

    /**
     * The source range for name string
     */
    nameLocation?: string;

    /**
     * Node id of scoped contract or source unit
     */
    scope: number;

    /**
     * Struct visibility
     */
    visibility: string;

    constructor(
        id: number,
        src: string,
        name: string,
        scope: number,
        visibility: string,
        members: Iterable<VariableDeclaration>,
        documentation?: string | StructuredDocumentation,
        nameLocation?: string,
        raw?: any
    ) {
        super(id, src, raw);

        this.name = name;
        this.scope = scope;
        this.visibility = visibility;
        this.nameLocation = nameLocation;
        for (const member of members) {
            this.appendChild(member);
        }
        this.documentation = documentation;
        this.acceptChildren();
    }

    /**
     * Canonical name (or qualified name), e.g. `DefiningContract.SomeStruct`
     */
    get canonicalName(): string {
        return getFQDefName(this);
    }

    /**
     * Members of the struct
     */
    get vMembers(): VariableDeclaration[] {
        return this.ownChildren as VariableDeclaration[];
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.documentation, this.vMembers);
    }

    /**
     * Reference to its scoped contract or source unit
     */
    get vScope(): ContractDefinition | SourceUnit {
        return this.requiredContext.locate(this.scope) as ContractDefinition | SourceUnit;
    }

    set vScope(value: ContractDefinition | SourceUnit) {
        if (!this.requiredContext.contains(value)) {
            throw new Error(`Node ${value.type}#${value.id} not belongs to a current context`);
        }

        this.scope = value.id;
    }
}
