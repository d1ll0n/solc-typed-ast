// import { ASTReader, ASTSearch, CompilerKind, LatestCompilerVersion, compileSol } from "../src";
import {
    ASTReader,
    ASTSearch,
    CompilerKind,
    FunctionDefinition,
    LatestCompilerVersion,
    compileSourceString
} from "../src";

async function getSourceUnit(code: string) {
    const result = await compileSourceString(
        "SomeFile.sol",
        code,
        LatestCompilerVersion,
        undefined,
        undefined,
        undefined,
        CompilerKind.WASM
    );
    const reader = new ASTReader();

    const [sourceUnit] = reader.read(result.data);
    return sourceUnit;
}

const code = `
struct ABC {
  uint256 x;
}

function test()  {
  uint256 y = 3;
  ABC memory abc = ABC(y);
  uint256 z = y + 1;
}
`;

async function test() {
    const sourceUnit = await getSourceUnit(code);
    const fn = sourceUnit.getChildrenByType(FunctionDefinition)[0];
    const search = ASTSearch.from(fn);
    const struct = ASTSearch.from(sourceUnit).find("StructDefinition", { name: "ABC" })[0];
    console.log(
        //[./UserDefinedTypeName[@referencedDeclaration=${struct.id}]]
        ASTSearch.from(fn)
            .queryAll(`//VariableDeclaration/@vType[@referencedDeclaration=${struct.id}]`)
            .map((v) => v.type)
    );

    const decl = search.find("VariableDeclaration", {
        vType: {
            referencedDeclaration: struct.id
        }
    })[0];

    // const callBy = search.find("FunctionCall", {
    //   vord
    // })

    console.log(`Found decl! ${decl.name}`);
}

test();
