import { fmt, PPIsh } from "..";

export function forAll<T>(iterable: Iterable<T>, cb: (v: T) => boolean): boolean {
    for (const el of iterable) {
        if (!cb(el)) {
            return false;
        }
    }

    return true;
}

export function forAny<T>(iterable: Iterable<T>, cb: (v: T) => boolean): boolean {
    for (const el of iterable) {
        if (cb(el)) {
            return true;
        }
    }

    return false;
}

export function assert(
    condition: boolean,
    message: string,
    ...details: PPIsh[]
): asserts condition {
    if (condition) {
        return;
    }

    throw new Error(fmt(message, ...details));
}

/**
 * Recursively search all values in an object or array.
 * @param obj Object to search recursively
 * @param matchKey Key an object must have to be matched
 * @param cb Callback function to check objects with a matching key.
 * If no callback provided, collects all properties at `matchKey` anywhere in the tree.
 * If callback returns `true` for `node`, `node[matchKey]` is collected.
 * If callback returns anything else, returned value is collected.
 * @param onlyFirst Whether to stop after first located element
 */
export function deepFindIn(
    obj: any,
    matchKey: string | number,
    cb?: (o: any) => any,
    onlyFirst?: boolean
): any[] {
    const result: any[] = [];
    for (const key of Object.getOwnPropertyNames(obj)) {
        const value = obj[key];
        if (key === matchKey) {
            if (!cb) result.push(value);
            else {
                const ret = cb(obj);
                if (ret || typeof ret === "number") {
                    result.push(typeof ret === "boolean" ? value : ret);
                }
            }
        } else if (value && typeof value === "object") {
            result.push(...deepFindIn(value, matchKey, cb));
        }
        if (onlyFirst && result.length) break;
    }
    return result;
}

type AmbiguousArray<T> = T[] | readonly T[];

type KeysToValues<Obj, Keys extends AmbiguousArray<keyof Obj>> = Keys["length"] extends 0
    ? []
    : Keys extends
          | readonly [infer T1 extends keyof Obj, ...infer Rest]
          | [infer T1 extends keyof Obj, ...infer Rest]
    ? Rest extends AmbiguousArray<keyof Obj>
        ? [Obj[T1], ...KeysToValues<Obj, Rest>]
        : [Obj[T1]]
    : [];

export function extractProperties<Obj, Keys extends AmbiguousArray<keyof Obj>>(
    obj: Obj,
    keys: Keys
): KeysToValues<Obj, Keys> {
    return keys.map((key) => obj[key]) as KeysToValues<Obj, Keys>;
}

export const coerceArray = <T>(doc: T | T[]): T[] => (Array.isArray(doc) ? doc : [doc]);
type Constructor<C> = new (...args: any[]) => C;

export const isInstanceOf = <NodeTypes extends Array<Constructor<any>>>(
    node: any,
    ...nodeTypes: NodeTypes
): node is InstanceType<NodeTypes[number]> => nodeTypes.some((type) => node instanceof type);
