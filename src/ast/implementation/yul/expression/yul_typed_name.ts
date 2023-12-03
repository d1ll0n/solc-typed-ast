import { YulExpression } from "./yul_expression";

export class YulTypedName extends YulExpression {
    readonly type = "YulTypedName";

    /**
     * Name of the identifier
     */
    name: string;

    /**
     * Yul type string, e.g.u256
     */
    typeString: string;

    constructor(
        id: number,
        src: string,
        name: string,
        typeString = "",
        raw?: any,
        nativeSrc?: string
    ) {
        super(id, src, raw, nativeSrc);

        this.name = name;
        this.typeString = typeString;
    }
}
