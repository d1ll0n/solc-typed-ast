import * as declaration from "./declaration";
import * as expression from "./expression";
import * as meta from "./meta";
import * as statement from "./statement";
import * as type from "./type";
import * as yul from "./yul";

export * from "./declaration";
export * from "./expression";
export * from "./meta";
export * from "./statement";
export * from "./type";
export * from "./yul";

export const ASTNodeConstructorsList = [
    /* declaration */
    declaration.ContractDefinition,
    declaration.EnumDefinition,
    declaration.EnumValue,
    declaration.ErrorDefinition,
    declaration.EventDefinition,
    declaration.FunctionDefinition,
    declaration.ModifierDefinition,
    declaration.StructDefinition,
    declaration.UserDefinedValueTypeDefinition,
    declaration.VariableDeclaration,
    /* expression */
    expression.Assignment,
    expression.BinaryOperation,
    expression.Conditional,
    expression.ElementaryTypeNameExpression,
    expression.FunctionCall,
    expression.FunctionCallOptions,
    expression.Identifier,
    expression.IndexAccess,
    expression.IndexRangeAccess,
    expression.Literal,
    expression.MemberAccess,
    expression.NewExpression,
    expression.TupleExpression,
    expression.UnaryOperation,
    /* meta */
    meta.IdentifierPath,
    meta.ImportDirective,
    meta.InheritanceSpecifier,
    meta.ModifierInvocation,
    meta.OverrideSpecifier,
    meta.ParameterList,
    meta.PragmaDirective,
    meta.SourceUnit,
    meta.StructuredDocumentation,
    meta.UsingForDirective,
    /* statement */
    statement.Block,
    statement.Break,
    statement.Continue,
    statement.DoWhileStatement,
    statement.EmitStatement,
    statement.ExpressionStatement,
    statement.ForStatement,
    statement.IfStatement,
    statement.InlineAssembly,
    statement.PlaceholderStatement,
    statement.Return,
    statement.RevertStatement,
    statement.Throw,
    statement.TryCatchClause,
    statement.TryStatement,
    statement.UncheckedBlock,
    statement.VariableDeclarationStatement,
    statement.WhileStatement,
    /* type */
    type.ArrayTypeName,
    type.ElementaryTypeName,
    type.FunctionTypeName,
    type.Mapping,
    type.UserDefinedTypeName,
    /* yul.expression */
    yul.YulFunctionCall,
    yul.YulIdentifier,
    yul.YulLiteral,
    yul.YulTypedName,
    /* yul.statement */
    yul.YulAssignment,
    yul.YulBlock,
    yul.YulBreak,
    yul.YulCase,
    yul.YulContinue,
    yul.YulExpressionStatement,
    yul.YulFunctionDefinition,
    yul.YulForLoop,
    yul.YulIf,
    yul.YulLeave,
    yul.YulSwitch,
    yul.YulVariableDeclaration
] as const;

export type ExtractConstructorClass<ConstructorType> = ConstructorType extends new (
    id: number,
    src: string,
    ...args: any[]
) => infer Class
    ? Class extends ASTNodeType
        ? Class
        : never
    : never;
export const ASTNodeClassEntries = ASTNodeConstructorsList.map(
    (cls) => [cls.name, cls] as ASTNodeClassEntry
) as ASTNodeClassEntriesType;

export const astNodeConstructorMap = Object.fromEntries(
    ASTNodeConstructorsList.map((cls) => [cls.name, cls] as ASTNodeClassEntry)
) as ASTNodeConstructorMap;

// Source: https://stackoverflow.com/questions/67605122/obtain-a-slice-of-a-typescript-parameters-tuple

type TupleSplit<T, N extends number, O extends readonly any[] = readonly []> = O["length"] extends N
    ? [O, T]
    : T extends readonly [infer F, ...infer R]
    ? TupleSplit<readonly [...R], N, readonly [...O, F]>
    : [O, T];

type TakeFirst<T extends readonly any[], N extends number> = TupleSplit<T, N>[0];

type SkipFirst<T extends readonly any[], N extends number> = TupleSplit<T, N>[1];

type TupleSlice<T extends readonly any[], S extends number, E extends number> = SkipFirst<
    TakeFirst<T, E>,
    S
>;
export type ASTNodeConstructorOf<T extends ASTNodeType> = Extract<
    ASTNodeConstructorType,
    Constructor<T>
>;

//ExportedValues extends infer C ? (C extends ASTNode ? C : never) : never;
export type ExtractedArguments<C extends ASTNodeConstructorType> = SkipFirst<
    ConstructorParameters<C>,
    2
>;

type ClassesList = typeof ASTNodeConstructorsList;
type ASTNodeClassEntriesType = [
    ...ArrayToEntriesWithKey<TupleSlice<ClassesList, 0, 20>, "type">,
    ...ArrayToEntriesWithKey<TupleSlice<ClassesList, 20, 40>, "type">,
    ...ArrayToEntriesWithKey<TupleSlice<ClassesList, 40, 60>, "type">,
    ...ArrayToEntriesWithKey<TupleSlice<ClassesList, 60, 80>, "type">
];
export type ASTNodeClassEntry = ASTNodeClassEntriesType[number];
export type ASTNodeConstructorType = ASTNodeClassEntry[1];
export type ASTNodeType = InstanceType<ASTNodeClassEntry[1]>;
export type ASTNodeKind = ASTNodeType["type"];
export type ASTNodeConstructorMap = {
    [K in ASTNodeKind]: Extract<ASTNodeConstructorType, Constructor<{ type: K }>>;
};

export type ASTNodeMap = {
    [K in ASTNodeKind]: Extract<InstanceType<ASTNodeConstructorType>, { type: K }>;
};

type Constructor<C> = new (...args: any[]) => C;

type ConstructorToEntryByKey<C, K> = C extends Constructor<infer Obj>
    ? K extends keyof Obj
        ? [[Obj[K], C /* Obj */]]
        : []
    : [];

type ArrayToEntriesWithKey<T, Key> = T extends ReadonlyArray<Constructor<any>>
    ? T extends readonly [infer O1, ...infer Rest]
        ? [...ConstructorToEntryByKey<O1, Key>, ...ArrayToEntriesWithKey<Rest, Key>]
        : []
    : [];
