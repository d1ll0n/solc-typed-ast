import { StructuredDocumentation } from "../../meta";
import { YulCode } from "./yul_code";
import { YulData } from "./yul_data";
import { YulStatementWithChildren } from "./yul_statement";

export class YulObject extends YulStatementWithChildren<
    YulData | YulCode | YulObject | StructuredDocumentation
> {
    readonly type = "YulObject";

    name: string;
    code: YulCode;
    subObjects: Array<YulObject | YulData>;

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
        super(id, src, documentation, raw, nativeSrc);
        this.name = name;
        this.code = code;
        this.subObjects = subObjects;
        this.acceptChildren();
    }
}
