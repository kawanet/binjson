/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

import * as A from "./h-array";
import * as B from "./h-boolean";
import * as M from "./h-misc";
import * as N from "./h-number";
import * as O from "./h-object";
import * as S from "./h-string";
import * as W from "./h-widestring";
import * as XB from "./h-buffer";
import * as XT from "./h-typedarray";

type ReadHandler<T> = binjson.ReadHandler<T>;
type WriteHandler<T> = binjson.WriteHandler<T>;
type WriteRouter<T> = (value: T) => binjson.WriteHandler<T>;

const {hArrayBegin, hArrayEnd} = A;
const {hFalse, hTrue} = B;
const {hDate, hNull, hRegExp, hUndefined} = M;
const {hBigInt, hDouble, hInt32, hNumber0} = N;
const {hObjectBegin, hObjectEnd} = O;
const {hString} = S;
const {hWideString} = W;
const {hNodeBuffer} = XB;
const {hArrayBufferView} = XT;

const rBoolean: WriteRouter<boolean> = value => value ? hTrue : hFalse;

const hBooleanObject: WriteHandler<boolean | Boolean> = {
    allowToJSON: true,
    write: (buf, value, next) => {
        const bool = Boolean(+value);
        return rBoolean(bool).write(buf, bool, next);
    },
};

// const rNumber: WriteRouter<number> = value => ((value | 0) == value) ? hInt32 : isFinite(value) ? hDouble : hNull;

const rNumber: WriteRouter<number> = v => ((v | 0) == v) ? ((0 <= v && v <= 9) ? hNumber0 : hInt32) : (isFinite(v) ? hDouble : hNull);

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
    const readers: ReadHandler<any>[] = [];

    [
        hArrayBegin,
        hArrayBufferView,
        hArrayEnd,
        hBigInt,
        hDate,
        hDouble,
        hFalse,
        hInt32,
        hNodeBuffer,
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
            handler = hArrayBegin;
        } else if (value instanceof Boolean) {
            handler = hBooleanObject;
        } else if (value instanceof Number) {
            handler = hNumberObject;
        } else if (value instanceof String) {
            handler = hStringObject;
        } else if (isArrayBufferView(value)) {
            handler = hArrayBufferView;
        } else {
            handler = hObjectBegin;
        }

        return handler;
    }
}

const isArrayBufferView = hArrayBufferView.match;
