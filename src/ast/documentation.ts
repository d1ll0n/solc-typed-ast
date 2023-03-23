import { ASTNode, ASTNodeWithChildren } from "./ast_node";
import { StructuredDocumentation } from "./implementation/meta";

export function extractDocumentationText(docBlock: string): string {
    const result: string[] = [];

    const replacers = docBlock.startsWith("///") ? ["/// ", "///"] : ["/**", "*/", "* ", "*"];
    const lines = docBlock.split("\n");

    for (let line of lines) {
        line = line.trimStart();

        for (const replacer of replacers) {
            line = line.replace(replacer, "");
        }
        console.log(line);
        result.push(line);
    }

    return result.join("\n").trim();
}

export interface WithPrecedingDocs {
    documentation?: string | StructuredDocumentation;

    /**
     * This field is used as a storage field for string,
     * if string is set as value for `documentation`.
     */
    docString?: string;
}

export interface WithDanglingDocs {
    danglingDocumentation?: string | StructuredDocumentation;

    /**
     * This field is used as a storage field for string,
     * if string is set as value for `danglingDocumentation`.
     */
    danglingDocString?: string;
}

export function getDocumentation<T extends ASTNode = ASTNode>(
    node: WithPrecedingDocs & ASTNodeWithChildren<T>
): string | StructuredDocumentation | undefined {
    if (node.docString !== undefined) {
        return node.docString;
    }

    const ownLoc = node.sourceInfo;
    const children = node.children;

    for (let c = 0; c < children.length; c++) {
        const child = children[c];

        if (child instanceof StructuredDocumentation) {
            const childLoc = child.sourceInfo;

            /**
             * Note that preceding documentation nodes are
             * EXCLUDED from source range of parent node.
             */
            if (childLoc.offset <= ownLoc.offset) {
                return child;
            }
        }
    }

    return undefined;
}

export function setDocumentation<T extends ASTNode = ASTNode>(
    node: WithPrecedingDocs & ASTNodeWithChildren<T>,
    value: string | StructuredDocumentation | undefined
): void {
    const old = node.documentation;

    if (value instanceof StructuredDocumentation) {
        node.docString = undefined;

        if (old instanceof StructuredDocumentation) {
            if (value !== old) {
                node.replaceChild(value as any, old as any);
            }
        } else {
            node.insertAtBeginning(value as any);
        }
    } else {
        if (old instanceof StructuredDocumentation) {
            node.removeChild(old as any);
        }

        node.docString = value;
    }
}

export function getDanglingDocumentation<T extends ASTNode = ASTNode>(
    node: WithDanglingDocs & ASTNodeWithChildren<T>
): string | StructuredDocumentation | undefined {
    if (node.danglingDocString !== undefined) {
        return node.danglingDocString;
    }

    const ownLoc = node.sourceInfo;
    const children = node.children;

    for (let c = children.length - 1; c >= 0; c--) {
        const child = children[c];

        if (child instanceof StructuredDocumentation) {
            const childLoc = child.sourceInfo;

            /**
             * Note that preceding documentation nodes are
             * INCLUDED from source range of parent node.
             */
            if (childLoc.offset > ownLoc.offset) {
                return child;
            }
        }
    }

    return undefined;
}

export function setDanglingDocumentation<T extends ASTNode = ASTNode>(
    node: WithDanglingDocs & ASTNodeWithChildren<T>,
    value: string | StructuredDocumentation | undefined
): void {
    const old = node.danglingDocumentation;

    if (value instanceof StructuredDocumentation) {
        node.danglingDocString = undefined;

        if (old instanceof StructuredDocumentation) {
            if (value !== old) {
                node.replaceChild<any, any>(value, old);
            }
        } else {
            node.appendChild(value as any);
        }
    } else {
        if (old instanceof StructuredDocumentation) {
            node.removeChild(old as any);
        }

        node.danglingDocString = value;
    }
}
