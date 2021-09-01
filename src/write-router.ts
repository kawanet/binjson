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
import * as T from "./h-typedarray";
import * as W from "./h-widestring";
import * as X from "./h-binary";
import {Binary} from "./h-binary";
import {WriteRoute} from "./write-route";

type Handler1<T> = binjson.Handler1<T, any>;
type WriteHandler1<T> = Pick<Handler1<T>, "match" | "native" | "write">;
type WriteRouter1<T> = (value: T) => WriteHandler1<T>;

const {hArrayBegin} = A;
const {hFalse, hTrue} = B;
const {hNull} = M;
const {hBigInt, hDouble, hInt32, hNumber0} = N;
const {hObjectBegin} = O;
const {hString} = S;
const {hArrayBuffer, hArrayBufferView} = T;
const {hWideString} = W;
const {hBinary} = X;

/**
 * boolean
 */

const booleanRouter: WriteRouter1<boolean> = v => (v ? hTrue : hFalse);

const hBooleanObject: WriteHandler1<boolean | Boolean> = {
    native: true,

    write: (buf, value, next) => {
        const bool = Boolean(+value);
        return booleanRouter(bool).write(buf, bool, next);
    },
};

/**
 * number
 */

const numberRouter: WriteRouter1<number> = v => ((v | 0) == v) ? ((0 <= v && v <= 9) ? hNumber0 : hInt32) : (isFinite(v) ? hDouble : hNull);

const hNumberObject: WriteHandler1<number | Number> = {
    native: true,

    write: (buf, value, next) => {
        const num = Number(value);
        return numberRouter(num).write(buf, num, next);
    },
};

/**
 * hUtf8String has better performance on short string.
 * hTwoByteString has better performance on long string.
 */

const stringRouter: WriteRouter1<string> = v => ((v.length <= 53) ? hString : hWideString);

const hStringObject: WriteHandler1<string | String> = {
    native: true,

    write: (buf, value, next) => {
        const str = String(value);
        return stringRouter(str).write(buf, str, next)
    },
};

/**
 * the typeofRouter is executed before HandlerX-s enabled.
 * order: extended Handler1 -> this typeofRouter -> extended handlerX -> objectRouter.
 */

const typeofRouter: WriteRouter1<any> = value => {
    if ("string" === typeof value) return stringRouter(value);
    if ("number" === typeof value) return numberRouter(value);
    if ("object" === typeof value) return eagerObjectRouter(value);
    if ("boolean" === typeof value) return booleanRouter(value);
    if ("bigint" === typeof value) return hBigInt;
};

const eagerObjectRouter: WriteRouter1<object> = value => {
    if (value === null) return hNull;
    if (value.constructor === Object) return hObjectBegin;
    if (value.constructor === Array) return hArrayBegin;
    if (value.constructor === Binary) return hBinary;
};

/**
 * the objectRouter is executed after HandleX-s enabled.
 * order: extended Handler1 -> typeofRouter -> extended handlerX -> this objectRouter.
 */

export const objectRouter: WriteRouter1<any> = value => {
    if ("object" !== typeof value) return;
    if (value === null) return hNull;
    if (Array.isArray(value)) return hArrayBegin;
    if (Binary.isBinary(value)) return hBinary;
    if (value instanceof Boolean) return hBooleanObject;
    if (value instanceof Number) return hNumberObject;
    if (value instanceof String) return hStringObject;
    return hObjectBegin;
};

const initDefault = (): WriteRoute => {
    const route = new WriteRoute({writeRouter1: typeofRouter});

    route.add(hArrayBuffer);
    route.add(hArrayBufferView, ArrayBuffer.isView);

    return route;
};

export const defaultWriteRoute = initDefault();
