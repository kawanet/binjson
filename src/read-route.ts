/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {hBuffer} from "./h-buffer";
import {hDate, hNull, hRegExp, hUndefined} from "./h-misc";
import {hString} from "./h-string";
import {hWideString} from "./h-widestring";
import {hArrayBegin, hArrayEnd} from "./h-array";
import {hArrayBufferView} from "./h-typedarray";
import {hBigInt, hDouble, hInt32, hNumber0} from "./h-number";
import {hFalse, hTrue} from "./h-boolean";
import {hObjectBegin, hObjectEnd} from "./h-object";

export const handlers: binjson.Handlers = {
    Buffer: hBuffer,
    Date: hDate,
    RegExp: hRegExp,
    UTF8: hString,
    UTF16: hWideString,
    Undefined: hUndefined,
};

/**
 * default router for `decode()`.
 */

export function initReadRouter(): (tag: number) => binjson.ReadHandler<any> {
    const readers: binjson.ReadHandler<any>[] = [];

    [
        hArrayBegin,
        hArrayBufferView,
        hArrayEnd,
        hBigInt,
        hBuffer,
        hDouble,
        hDate,
        hFalse,
        hInt32,
        hNull,
        hNumber0,
        hObjectBegin,
        hObjectEnd,
        hRegExp,
        hString,
        hTrue,
        hUndefined,
        hWideString,
    ].forEach(h => {
        const {tag} = h;
        if (Array.isArray(tag)) {
            for (const t of tag) readers[t] = h;
        } else {
            readers[tag] = h
        }
    });

    return tag => readers[tag];
}
