import { extractProperties } from "../misc";
import { ASTNode } from "./ast_node";
import { ASTNodeConstructorType, ExtractConstructorClass } from "./implementation/index";
import {
    /* declaration */
    ContractDefinition,
    EnumDefinition,
    EnumValue,
    ErrorDefinition,
    EventDefinition,
    FunctionDefinition,
    ModifierDefinition,
    StructDefinition,
    UserDefinedValueTypeDefinition,
    VariableDeclaration,
    /* expression */
    Assignment,
    BinaryOperation,
    Conditional,
    ElementaryTypeNameExpression,
    FunctionCall,
    FunctionCallOptions,
    Identifier,
    IndexAccess,
    IndexRangeAccess,
    Literal,
    MemberAccess,
    NewExpression,
    TupleExpression,
    UnaryOperation,
    /* meta */
    IdentifierPath,
    ImportDirective,
    InheritanceSpecifier,
    ModifierInvocation,
    OverrideSpecifier,
    ParameterList,
    PragmaDirective,
    SourceUnit,
    StructuredDocumentation,
    UsingForDirective,
    /* statement */
    Block,
    Break,
    Continue,
    DoWhileStatement,
    EmitStatement,
    ExpressionStatement,
    ForStatement,
    IfStatement,
    InlineAssembly,
    PlaceholderStatement,
    Return,
    RevertStatement,
    Throw,
    TryCatchClause,
    TryStatement,
    UncheckedBlock,
    VariableDeclarationStatement,
    WhileStatement,
    /* types */
    ArrayTypeName,
    ElementaryTypeName,
    FunctionTypeName,
    Mapping,
    UserDefinedTypeName,
    // /* yul */
    YulAssignment,
    YulBlock,
    YulBreak,
    YulContinue,
    YulCase,
    YulExpressionStatement,
    YulForLoop,
    YulFunctionDefinition,
    YulIf,
    YulLeave,
    YulSwitch,
    YulVariableDeclaration,
    YulLiteral,
    YulIdentifier,
    YulFunctionCall,
    YulTypedName
} from "./implementation/index";
/**
 * When applied to following tuple type:
 * ```
 * [id: number, src: string, rest: any]
 * ```
 * Skips first two arguments (`id` and `src`) and infers only `rest`.
 *
 * This will further be applied to constructor argument tuple types, like
 * `ConstructorParameters<typeof VariableDeclaration>` (for example)
 * to infer only `VariableDeclaration`-specific arguments as the necessary.
 * The leading `id` and `src` will be generated by `ASTNodeFactory`.
 */
type NodeSpecificArguments<Args extends any[]> = Args["length"] extends 0
    ? []
    : // : Args extends [id: number, src: string, ...rest: infer Rest]
    // ? Rest extends any [] ? Rest :
    // : [];
    ((...args: Args) => void) extends (id: number, src: string, ...rest: infer Rest) => void
    ? Rest extends any[]
        ? Rest
        : []
    : [];

export type ExtractedArguments<T extends ASTNodeConstructorType> = NodeSpecificArguments<
    ConstructorParameters<T>
>;

type ExtractionKV<T extends ASTNodeConstructorType> = [
    T,
    (node: ExtractConstructorClass<T>) => ExtractedArguments<T>
];

const argumentExtractors = [
    [ASTNode, (node: ASTNode) => extractProperties(node, ["raw"] as const)],
    [
        ContractDefinition,
        (node: ContractDefinition) =>
            extractProperties(node, [
                "name",
                "scope",
                "kind",
                "abstract",
                "fullyImplemented",
                "linearizedBaseContracts",
                "usedErrors",
                "documentation",
                "children",
                "nameLocation",
                "raw"
            ] as const)
    ],
    [
        EnumDefinition,
        (node: EnumDefinition) =>
            extractProperties(node, ["name", "vMembers", "nameLocation", "raw"] as const)
    ],
    [
        EnumValue,
        (node: EnumValue) => extractProperties(node, ["name", "nameLocation", "raw"] as const)
    ],
    [
        ErrorDefinition,
        (node: ErrorDefinition) =>
            extractProperties(node, [
                "name",
                "vParameters",
                "documentation",
                "nameLocation",
                "raw"
            ] as const)
    ],
    [
        EventDefinition,
        (node: EventDefinition) =>
            extractProperties(node, [
                "anonymous",
                "name",
                "vParameters",
                "documentation",
                "nameLocation",
                "raw"
            ] as const)
    ],
    [
        FunctionDefinition,
        (node: FunctionDefinition) =>
            extractProperties(node, [
                "scope",
                "kind",
                "name",
                "virtual",
                "visibility",
                "stateMutability",
                "isConstructor",
                "vParameters",
                "vReturnParameters",
                "vModifiers",
                "vOverrideSpecifier",
                "vBody",
                "documentation",
                "nameLocation",
                "raw"
            ] as const)
    ],
    [
        ModifierDefinition,
        (node: ModifierDefinition) =>
            extractProperties(node, [
                "name",
                "virtual",
                "visibility",
                "vParameters",
                "vOverrideSpecifier",
                "vBody",
                "documentation",
                "nameLocation",
                "raw"
            ] as const)
    ],
    [
        StructDefinition,
        (node: StructDefinition) =>
            extractProperties(node, [
                "name",
                "scope",
                "visibility",
                "vMembers",
                "nameLocation",
                "raw"
            ] as const)
    ],
    [
        UserDefinedValueTypeDefinition,
        (node: UserDefinedValueTypeDefinition) =>
            extractProperties(node, ["name", "underlyingType", "nameLocation", "raw"] as const)
    ],
    [
        VariableDeclaration,
        (node: VariableDeclaration) =>
            extractProperties(node, [
                "constant",
                "indexed",
                "name",
                "scope",
                "stateVariable",
                "storageLocation",
                "visibility",
                "mutability",
                "typeString",
                "documentation",
                "vType",
                "vOverrideSpecifier",
                "vValue",
                "nameLocation",
                "raw"
            ] as const)
    ],
    [
        Assignment,
        (node: Assignment) =>
            extractProperties(node, [
                "typeString",
                "operator",
                "vLeftHandSide",
                "vRightHandSide",
                "raw"
            ] as const)
    ],
    [
        BinaryOperation,
        (node: BinaryOperation) =>
            extractProperties(node, [
                "typeString",
                "operator",
                "vLeftExpression",
                "vRightExpression",
                "raw"
            ] as const)
    ],
    [
        Conditional,
        (node: Conditional) =>
            extractProperties(node, [
                "typeString",
                "vCondition",
                "vTrueExpression",
                "vFalseExpression",
                "raw"
            ] as const)
    ],
    [
        ElementaryTypeNameExpression,
        (node: ElementaryTypeNameExpression) =>
            extractProperties(node, ["typeString", "typeName", "raw"] as const)
    ],
    [
        FunctionCallOptions,
        (node: FunctionCallOptions) =>
            extractProperties(node, ["typeString", "vExpression", "vOptionsMap", "raw"] as const)
    ],
    [
        FunctionCall,
        (node: FunctionCall) =>
            extractProperties(node, [
                "typeString",
                "kind",
                "vExpression",
                "vArguments",
                "fieldNames",
                "raw"
            ] as const)
    ],
    [
        Identifier,
        (node: Identifier): ExtractedArguments<typeof Identifier> =>
            extractProperties(node, ["typeString", "name", "referencedDeclaration", "raw"] as const)
    ],
    [
        IdentifierPath,
        (node: IdentifierPath) =>
            extractProperties(node, ["name", "referencedDeclaration", "raw"] as const)
    ],
    [
        IndexAccess,
        (node: IndexAccess) =>
            extractProperties(node, [
                "typeString",
                "vBaseExpression",
                "vIndexExpression",
                "raw"
            ] as const)
    ],
    [
        IndexRangeAccess,
        (node: IndexRangeAccess) =>
            extractProperties(node, [
                "typeString",
                "vBaseExpression",
                "vStartExpression",
                "vEndExpression",
                "raw"
            ] as const)
    ],
    [
        Literal,
        (node: Literal) =>
            extractProperties(node, [
                "typeString",
                "kind",
                "hexValue",
                "value",
                "subdenomination",
                "raw"
            ] as const)
    ],
    [
        MemberAccess,
        (node: MemberAccess) =>
            extractProperties(node, [
                "typeString",
                "vExpression",
                "memberName",
                "referencedDeclaration",
                "raw"
            ] as const)
    ],
    [
        NewExpression,
        (node: NewExpression) =>
            extractProperties(node, ["typeString", "vTypeName", "raw"] as const)
    ],
    [
        TupleExpression,
        (node: TupleExpression) =>
            extractProperties(node, [
                "typeString",
                "isInlineArray",
                "vOriginalComponents",
                "raw"
            ] as const)
    ],
    [
        UnaryOperation,
        (node: UnaryOperation) =>
            extractProperties(node, [
                "typeString",
                "prefix",
                "operator",
                "vSubExpression",
                "raw"
            ] as const)
    ],
    [
        ImportDirective,
        (node: ImportDirective) =>
            extractProperties(node, [
                "file",
                "absolutePath",
                "unitAlias",
                "symbolAliases",
                "scope",
                "sourceUnit",
                "raw"
            ] as const)
    ],
    [
        InheritanceSpecifier,
        (node: InheritanceSpecifier) =>
            extractProperties(node, ["vBaseType", "vArguments", "raw"] as const)
    ],
    [
        ModifierInvocation,
        (node: ModifierInvocation) =>
            extractProperties(node, ["vModifierName", "vArguments", "kind", "raw"] as const)
    ],
    [
        OverrideSpecifier,
        (node: OverrideSpecifier) => extractProperties(node, ["vOverrides", "raw"] as const)
    ],
    [
        ParameterList,
        (node: ParameterList) => extractProperties(node, ["vParameters", "raw"] as const)
    ],
    [
        PragmaDirective,
        (node: PragmaDirective) => extractProperties(node, ["literals", "raw"] as const)
    ],
    [
        SourceUnit,
        (node: SourceUnit) =>
            extractProperties(node, [
                "sourceEntryKey",
                "sourceListIndex",
                "absolutePath",
                "exportedSymbols",
                "children",
                "raw"
            ] as const)
    ],
    [
        StructuredDocumentation,
        (node: StructuredDocumentation) => extractProperties(node, ["text", "raw"] as const)
    ],
    [
        UsingForDirective,
        (node: UsingForDirective) =>
            extractProperties(node, [
                "isGlobal",
                "vLibraryName",
                "vFunctionList",
                "vTypeName",
                "raw"
            ] as const)
    ],
    [
        Block,
        (node: Block) => extractProperties(node, ["vStatements", "documentation", "raw"] as const)
    ],
    [
        UncheckedBlock,
        (node: UncheckedBlock) =>
            extractProperties(node, ["vStatements", "documentation", "raw"] as const)
    ],
    [Break, (node: Break) => extractProperties(node, ["documentation", "raw"] as const)],
    [Continue, (node: Continue) => extractProperties(node, ["documentation", "raw"] as const)],
    [
        DoWhileStatement,
        (node: DoWhileStatement) =>
            extractProperties(node, ["vCondition", "vBody", "documentation", "raw"] as const)
    ],
    [
        EmitStatement,
        (node: EmitStatement) =>
            extractProperties(node, ["vEventCall", "documentation", "raw"] as const)
    ],
    [
        ExpressionStatement,
        (node: ExpressionStatement) =>
            extractProperties(node, ["vExpression", "documentation", "raw"] as const)
    ],
    [
        ForStatement,
        (node: ForStatement) =>
            extractProperties(node, [
                "vBody",
                "vInitializationExpression",
                "vCondition",
                "vLoopExpression",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        IfStatement,
        (node: IfStatement) =>
            extractProperties(node, [
                "vCondition",
                "vTrueBody",
                "vFalseBody",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        InlineAssembly,
        (node: InlineAssembly) =>
            extractProperties(node, [
                "externalReferences",
                "operations",
                "yul",
                "flags",
                "evmVersion",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        PlaceholderStatement,
        (node: PlaceholderStatement) => extractProperties(node, ["documentation", "raw"] as const)
    ],
    [
        Return,
        (node: Return) =>
            extractProperties(node, [
                "functionReturnParameters",
                "vExpression",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        RevertStatement,
        (node: RevertStatement) =>
            extractProperties(node, ["errorCall", "documentation", "raw"] as const)
    ],
    [
        Throw,
        (node: Throw): ExtractedArguments<typeof Throw> =>
            extractProperties(node, ["documentation", "raw"] as const)
    ],
    [
        TryCatchClause,
        (node: TryCatchClause) =>
            extractProperties(node, [
                "errorName",
                "vBlock",
                "vParameters",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        TryStatement,
        (node: TryStatement) =>
            extractProperties(node, ["vExternalCall", "vClauses", "documentation", "raw"] as const)
    ],
    [
        VariableDeclarationStatement,
        (node: VariableDeclarationStatement) =>
            extractProperties(node, [
                "assignments",
                "vDeclarations",
                "vInitialValue",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        WhileStatement,
        (node: WhileStatement) =>
            extractProperties(node, ["vCondition", "vBody", "documentation", "raw"] as const)
    ],
    [
        ArrayTypeName,
        (node: ArrayTypeName) =>
            extractProperties(node, ["typeString", "vBaseType", "vLength", "raw"] as const)
    ],
    [
        ElementaryTypeName,
        (node: ElementaryTypeName): ExtractedArguments<typeof ElementaryTypeName> =>
            extractProperties(node, ["typeString", "name", "stateMutability", "raw"] as const)
    ],
    [
        FunctionTypeName,
        (node: FunctionTypeName) =>
            extractProperties(node, [
                "typeString",
                "visibility",
                "stateMutability",
                "vParameterTypes",
                "vReturnParameterTypes",
                "raw"
            ] as const)
    ],
    [
        Mapping,
        (node: Mapping) =>
            extractProperties(node, ["typeString", "vKeyType", "vValueType", "raw"] as const)
    ],
    [
        UserDefinedTypeName,
        (node: UserDefinedTypeName): ExtractedArguments<typeof UserDefinedTypeName> =>
            extractProperties(node, [
                "typeString",
                "name",
                "referencedDeclaration",
                "path",
                "raw"
            ] as const)
    ],
    [
        YulAssignment,
        (node: YulAssignment) =>
            extractProperties(node, ["variableNames", "value", "documentation"] as const)
    ],
    [
        YulBlock,
        (node: YulBlock) =>
            extractProperties(node, ["vStatements", "documentation", "raw"] as const)
    ],
    [YulBreak, (node: YulBreak) => extractProperties(node, ["documentation", "raw"] as const)],
    [
        YulContinue,
        (node: YulContinue) => extractProperties(node, ["documentation", "raw"] as const)
    ],
    [
        YulCase,
        (node: YulCase) =>
            extractProperties(node, ["value", "vBody", "documentation", "raw"] as const)
    ],
    [
        YulExpressionStatement,
        (node: YulExpressionStatement) =>
            extractProperties(node, ["vExpression", "documentation", "raw"] as const)
    ],
    [
        YulForLoop,
        (node: YulForLoop) =>
            extractProperties(node, [
                "vPre",
                "vCondition",
                "vPost",
                "vBody",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        YulFunctionDefinition,
        (node: YulFunctionDefinition) =>
            extractProperties(node, [
                "scope",
                "name",
                "vParameters",
                "vReturnParameters",
                "vBody",
                "documentation",
                "raw"
            ] as const)
    ],
    [
        YulIf,
        (node: YulIf) =>
            extractProperties(node, ["vCondition", "vBody", "documentation", "raw"] as const)
    ],
    [YulLeave, (node: YulLeave) => extractProperties(node, ["documentation", "raw"] as const)],
    [
        YulSwitch,
        (node: YulSwitch) =>
            extractProperties(node, ["vExpression", "vCases", "documentation", "raw"] as const)
    ],
    [
        YulVariableDeclaration,
        (node: YulVariableDeclaration) =>
            extractProperties(node, ["variables", "value", "documentation", "raw"] as const)
    ],
    [
        YulLiteral,
        (node: YulLiteral) =>
            extractProperties(node, [
                "kind",
                "value",
                "value",
                "hexValue",
                "typeString",
                "raw"
            ] as const)
    ],
    [
        YulIdentifier,
        (node: YulIdentifier) =>
            extractProperties(node, ["name", "referencedDeclaration", "raw"] as const)
    ],
    [
        YulFunctionCall,
        (node: YulFunctionCall) => extractProperties(node, ["vFunctionName", "vArguments", "raw"])
    ],
    [YulTypedName, (node: YulTypedName) => extractProperties(node, ["name", "typeString", "raw"])]
] as Array<ExtractionKV<ASTNodeConstructorType>>;

interface ASTNodeArgumentExtractor {
    get<T extends ASTNodeConstructorType>(
        ctor: T
    ): (node: ExtractConstructorClass<T>) => ExtractedArguments<T>;
}

export const argExtractionMapping = new Map(argumentExtractors) as ASTNodeArgumentExtractor;
