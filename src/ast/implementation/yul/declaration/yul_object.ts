import {
    getDanglingDocumentation,
    getDocumentation,
    setDanglingDocumentation,
    setDocumentation
} from "../../../documentation";
import { StructuredDocumentation } from "../../meta";
import { YulASTNodeWithChildren } from "../yul_ast_node";
import { YulCode } from "./yul_code";
import { YulData } from "../statement/yul_data";

export class YulObject extends YulASTNodeWithChildren<
    YulData | YulCode | YulObject | StructuredDocumentation
> {
    readonly type = "YulObject";

    docString?: string;
    danglingDocString?: string;

    name: string;
    vCode: YulCode;
    vSubObjects: Array<YulObject | YulData>;

    constructor(
        id: number,
        src: string,
        name: string,
        code: YulCode,
        subObjects: Array<YulObject | YulData>,
        documentation?: string | StructuredDocumentation,
        raw?: any,
        nativeSrc?: string
    ) {
        super(id, src, raw, nativeSrc);
        this.name = name;
        this.vCode = code;
        this.vSubObjects = subObjects;

        this.appendChild(code);
        for (const subObject of subObjects) {
            this.appendChild(subObject);
        }

        this.documentation = documentation;
    }

    /**
     * Optional documentation appearing above the contract definition:
     * - Is `undefined` when not specified.
     * - Is type of `string` when specified and compiler version is older than `0.6.3`.
     * - Is instance of `StructuredDocumentation` when specified and compiler version is `0.6.3` or newer.
     */
    get documentation(): string | StructuredDocumentation | undefined {
        return getDocumentation(this);
    }

    set documentation(value: string | StructuredDocumentation | undefined) {
        setDocumentation(this, value);
    }

    /**
     * Optional documentation that is dangling in the source fragment,
     * that is after end of last child and before the end of the current node.
     *
     * It is:
     * - Is `undefined` when not detected.
     * - Is type of `string` for compatibility reasons.
     */
    get danglingDocumentation(): string | StructuredDocumentation | undefined {
        return getDanglingDocumentation(this);
    }

    set danglingDocumentation(value: string | StructuredDocumentation | undefined) {
        setDanglingDocumentation(this, value);
    }
}
