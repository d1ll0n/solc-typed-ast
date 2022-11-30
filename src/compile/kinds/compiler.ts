import axios from "axios";
import { spawn, spawnSync } from "child_process";
import crypto from "crypto";
import fse from "fs-extra";
import path from "path";
import { CompilerKind, CompilerVersions } from "..";
import { assert } from "../../misc";
import { SolcInput } from "../input";
import { isExact } from "../version";
import {
    BINARIES_URL,
    CACHE_DIR,
    getCompilerMDForPlatform,
    getCompilerPrefixForOs,
    isSubDir
} from "./md";

export abstract class Compiler {
    constructor(public readonly version: string, public readonly path: string) {}

    abstract compile(inputJson: SolcInput): Promise<any>;

    abstract compileSync(inputJson: SolcInput): any;
}

export class NativeCompiler extends Compiler {
    async compile(input: SolcInput): Promise<any> {
        const child = spawn(this.path, ["--standard-json"], {});

        return new Promise((resolve, reject) => {
            child.stdin.write(JSON.stringify(input), "utf-8");
            child.stdin.end();

            let stdout = "";
            let stderr = "";

            child.stdout.on("data", (data) => {
                stdout += data;
            });

            child.stderr.on("data", (data) => {
                stderr += data;
            });

            child.on("close", (code) => {
                if (code !== 0) {
                    reject(`Compiler exited with code ${code}, stderr: ${stderr}`);
                    return;
                }

                if (stderr !== "") {
                    reject(`Compiler exited with non-empty stderr: ${stderr}`);
                    return;
                }

                let outJson: any;

                try {
                    outJson = JSON.parse(stdout);
                } catch (e) {
                    reject(e);
                    return;
                }

                resolve(outJson);
            });
        });
    }

    compileSync(input: SolcInput): any {
        const { stderr, stdout, status, error } = spawnSync(this.path, ["--standard-json"], {
            input: JSON.stringify(input),
            maxBuffer: 1024 * 1024 * 10
        });
        if (error) {
            throw error;
        }
        if (status !== 0) {
            throw Error(`Compiler exited with code ${status}, stderr: ${stderr}`);
        }
        if (stderr && stderr.toString() !== "") {
            throw Error(`Compiler exited with non-empty stderr: ${stderr}`);
        }
        const outJson = JSON.parse(stdout.toString());
        return outJson;
    }
}

export class WasmCompiler extends Compiler {
    compileSync(input: SolcInput): any {
        const solc = require("solc");
        const module = require(this.path);
        const wrappedModule = solc.setupMethods(module);
        const output = wrappedModule.compile(JSON.stringify(input));

        return JSON.parse(output);
    }

    async compile(input: SolcInput): Promise<any> {
        return this.compileSync(input);
    }
}

type CompilerMapping = [CompilerKind.Native, NativeCompiler] | [CompilerKind.WASM, WasmCompiler];

export function getCompilerLocalPath(prefix: string, compilerFileName: string): string {
    const compilerLocalPath = path.join(CACHE_DIR, prefix, compilerFileName);

    assert(
        isSubDir(compilerLocalPath, CACHE_DIR),
        `Path ${compilerLocalPath} escapes from cache dir ${CACHE_DIR}`
    );

    return compilerLocalPath;
}

export async function getCompilerForVersion<T extends CompilerMapping>(
    version: string,
    kind: T[0]
): Promise<T[1] | undefined> {
    assert(
        isExact(version),
        "Version string must contain exact SemVer-formatted version without any operators"
    );

    let prefix: string | undefined;

    if (kind === CompilerKind.Native) {
        prefix = getCompilerPrefixForOs();
    } else if (kind === CompilerKind.WASM) {
        prefix = "wasm";
    } else {
        throw new Error(`Unsupported compiler kind "${kind}"`);
    }

    assert(CompilerVersions.includes(version), `Unsupported ${kind} compiler version ${version}`);

    if (prefix === undefined) {
        return undefined;
    }

    const md = await getCompilerMDForPlatform(prefix, version);
    const compilerFileName = md.releases[version];

    if (compilerFileName === undefined) {
        return undefined;
    }

    const compilerLocalPath = getCompilerLocalPath(prefix, compilerFileName);

    if (!fse.existsSync(compilerLocalPath)) {
        const build = md.builds.find((b) => b.version === version);

        assert(
            build !== undefined,
            `Unable to find build metadata for ${prefix} compiler ${version} in "list.json"`
        );

        const response = await axios.get<Buffer>(`${BINARIES_URL}/${prefix}/${compilerFileName}`, {
            responseType: "arraybuffer"
        });

        const hash = crypto.createHash("sha256");

        hash.update(response.data);

        const digest = "0x" + hash.digest("hex");

        assert(
            digest === build.sha256,
            `Downloaded ${prefix} compiler ${version} hash ${digest} does not match hash ${build.sha256} from "list.json"`
        );

        /**
         * Native compilers are exeсutable files, so give them proper permissions.
         * WASM compilers are loaded by NodeJS, so write them as readonly common files.
         */
        const permissions = kind === CompilerKind.Native ? 0o555 : 0o444;

        await fse.writeFile(compilerLocalPath, response.data, { mode: permissions });
    }

    if (kind === CompilerKind.Native) {
        return new NativeCompiler(version, compilerLocalPath);
    }

    if (kind === CompilerKind.WASM) {
        return new WasmCompiler(version, compilerLocalPath);
    }

    throw new Error(`Unable to detemine compiler constructor for kind "${kind}"`);
}
