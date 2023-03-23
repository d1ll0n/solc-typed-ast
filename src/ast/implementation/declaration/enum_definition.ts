import { enumToIntType, getFQDefName } from "../../..";
import { ASTNode, ASTNodeWithChildren } from "../../ast_node";
import { SourceUnit } from "../meta/source_unit";
import { ContractDefinition } from "./contract_definition";
import { EnumValue } from "./enum_value";
import { StructuredDocumentation } from "../meta/structured_documentation";

export class EnumDefinition extends ASTNodeWithChildren<EnumValue> {
    readonly type = "EnumDefinition";

    documentation?: string | StructuredDocumentation;

    /**
     * The name of the enum
     */
    name: string;

    /**
     * The source range for name string
     */
    nameLocation?: string;

    constructor(
        id: number,
        src: string,
        name: string,
        members: Iterable<EnumValue>,
        documentation?: string | StructuredDocumentation,
        nameLocation?: string,
        raw?: any
    ) {
        super(id, src, raw);

        this.name = name;

        for (const member of members) {
            this.appendChild(member);
        }

        this.documentation = documentation;

        this.nameLocation = nameLocation;
        this.acceptChildren();
    }

    /**
     * Canonical name (or qualified name), e.g. `DefiningContract.SomeEnum`
     */
    get canonicalName(): string {
        return getFQDefName(this);
    }

    /**
     * Array of the enum values
     */
    get vMembers(): EnumValue[] {
        return this.ownChildren as EnumValue[];
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.documentation, this.vMembers);
    }

    /**
     * Reference to a scoped contract or source unit
     */
    get vScope(): ContractDefinition | SourceUnit {
        return this.parent as ContractDefinition | SourceUnit;
    }

    toUintTypeString(): string {
        return enumToIntType(this).pp();
    }
}
