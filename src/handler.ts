/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

import * as A from "./h-array";
import * as B from "./h-buffer";
import * as M from "./h-misc";
import * as O from "./h-object";
import * as P from "./h-primitive";
import * as S from "./h-string";
import * as T from "./h-typedarray";
import * as W from "./h-widestring";

type ReadHandler<T> = binjson.ReadHandler<T>;
type WriteHandler<T> = binjson.WriteHandler<T>;
type Handler<T> = binjson.Handler<T>;
type WriteRouter<T> = (value: T) => binjson.WriteHandler<T>;

const {hBeginDenseJSArray, hEndDenseJSArray} = A;
const {hNodeBuffer} = B;
const {hDate, hNull, hRegExp} = M;
const {hBeginJSObject, hEndJSObject} = O;
const {hBigInt, hDouble, hFalse, hInt32, hTrue, hUndefined} = P;
const {hString} = S;
const {hArrayBufferView} = T;
const {hWideString} = W;

const rBoolean: WriteRouter<boolean> = value => value ? hTrue : hFalse;

const hBooleanObject: WriteHandler<boolean | Boolean> = {
    allowToJSON: true,
    write: (buf, value, next) => {
        const bool = Boolean(+value);
        return rBoolean(bool).write(buf, bool, next);
    },
};

const rNumber: WriteRouter<number> = value => ((value | 0) == value) ? hInt32 : isFinite(value) ? hDouble : hNull;

const hNumberObject: WriteHandler<number | Number> = {
    allowToJSON: true,
    write: (buf, value, next) => {
        const num = Number(value);
        return rNumber(num).write(buf, num, next);
    },
};

/**
 * hUtf8String has better performance on short string.
 * hTwoByteString has better performance on long string.
 */

const rString: WriteRouter<string> = value => ((value.length <= 10) ? hString : hWideString);

const hStringObject: WriteHandler<string | String> = {
    allowToJSON: true,
    write: (buf, value, next) => {
        const str = String(value);
        return rString(str).write(buf, str, next)
    },
};

export const handlers: binjson.Handlers = {
    Buffer: hNodeBuffer,
    Date: hDate,
    RegExp: hRegExp,
    UTF8: hString,
    UTF16: hWideString,
    Undefined: hUndefined,
};

/**
 * default router for `decode()`.
 */

export function initReadRouter(): (tag: number) => ReadHandler<any> {
    const readers: Handler<any>[] = [];

    [
        hArrayBufferView,
        hBeginDenseJSArray,
        hBeginJSObject,
        hBigInt,
        hDate,
        hDouble,
        hEndDenseJSArray,
        hEndJSObject,
        hFalse,
        hInt32,
        hNodeBuffer,
        hNull,
        hRegExp,
        hTrue,
        hWideString,
        hUndefined,
        hString,
    ].forEach(h => readers[h.tag] = h);

    return tag => readers[tag];
}

/**
 * default router for `encode()`.
 * add missing handlers via `handler` option.
 */

export function initWriteRouter(): (value: any) => WriteHandler<any> {
    return value => {
        switch (typeof value) {
            case "number":
                return rNumber(value);
            case "string":
                return rString(value);
            case "boolean":
                return rBoolean(value);
            case "bigint":
                return hBigInt;
            case "object":
                break; // go below
            default:
                return; // unsupported
        }

        let handler: WriteHandler<any>;
        if (value === null) {
            handler = hNull;
        } else if (Array.isArray(value)) {
            handler = hBeginDenseJSArray;
        } else if (value instanceof Boolean) {
            handler = hBooleanObject;
        } else if (value instanceof Number) {
            handler = hNumberObject;
        } else if (value instanceof String) {
            handler = hStringObject;
        } else if (isArrayBufferView(value)) {
            handler = hArrayBufferView;
        } else {
            handler = hBeginJSObject;
        }

        return handler;
    }
}

const isArrayBufferView = hArrayBufferView.match;
