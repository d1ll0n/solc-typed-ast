import { ASTNode } from "../../ast_node";
import { Expression } from "../expression/expression";
import { StructuredDocumentation } from "../meta";
import { ParameterList } from "../meta/parameter_list";
import { Statement } from "./statement";

export class Return extends Statement {
	readonly type = "Return";

    /**
     * Id of the parameter list that specifies the return parameters
     */
    functionReturnParameters: number;

    /**
     * Expression that is returned (if specified)
     */
    vExpression?: Expression;

    constructor(
        id: number,
        src: string,
        functionReturnParameters: number,
        expression?: Expression,
        documentation?: string | StructuredDocumentation,
        raw?: any
    ) {
        super(id, src, documentation, raw);

        this.functionReturnParameters = functionReturnParameters;

        this.vExpression = expression;

        this.acceptChildren();
    }

    get children(): readonly ASTNode[] {
        return this.pickNodes(this.documentation, this.vExpression);
    }

    /**
     * The parameter list that specifies the return parameters
     */
    get vFunctionReturnParameters(): ParameterList {
        return this.requiredContext.locate(this.functionReturnParameters) as ParameterList;
    }

    set vFunctionReturnParameters(value: ParameterList) {
        if (!this.requiredContext.contains(value)) {
            throw new Error(`Node ${value.type}#${value.id} not belongs to a current context`);
        }

        this.functionReturnParameters = value.id;
    }
}
