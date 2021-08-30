/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {hBinary} from "./h-binary";
import {hBuffer} from "./h-buffer";
import {hDate, hNull, hRegExp, hUndefined} from "./h-misc";
import {hString} from "./h-string";
import {hWideString} from "./h-widestring";
import {hArrayBegin, hArrayEnd} from "./h-array";
import {hArrayBuffer, hArrayBufferView} from "./h-typedarray";
import {hBigInt, hDouble, hInt32, hNumber0} from "./h-number";
import {hFalse, hTrue} from "./h-boolean";
import {hObjectBegin, hObjectEnd} from "./h-object";
import {ReadRoute} from "./read-route";

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

const initDefault = () => {
    const route = new ReadRoute();

    route.add([
        hArrayBegin,
        hArrayBuffer,
        hArrayBufferView,
        hArrayEnd,
        hBigInt,
        hBinary,
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
    ]);

    return route;
};

export const defaultReadRoute = initDefault();
