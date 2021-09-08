/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {hBinary} from "./h-binary";
import {hBuffer} from "./h-buffer";
import {hDate, hNull, hRegExp, hUndefined} from "./h-misc";
import {hString, hStringBuffer, hStringNative, hStringPureJS} from "./h-string";
import {hArrayBegin, hArrayEnd} from "./h-array";
import {hArrayBuffer, hArrayBufferView} from "./h-typedarray";
import {hBigInt, hDouble, hInt32, hNumber0} from "./h-number";
import {hFalse, hTrue} from "./h-boolean";
import {hObjectBegin, hObjectEnd} from "./h-object";
import {ReadDriver} from "./read-driver";

export const handlers: binjson.Handlers = {
    Buffer: hBuffer,
    Date: hDate,
    RegExp: hRegExp,
    StringPureJS: hStringPureJS,
    StringBuffer: hStringBuffer,
    StringNative: hStringNative,
    Undefined: hUndefined,
};

/**
 * default router for `decode()`.
 */

const initDefault = () => {
    const driver = new ReadDriver();

    driver.add([
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
    ]);

    return driver;
};

export const defaultReader = initDefault();
