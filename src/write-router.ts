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
type WriteHandler1<T> = Pick<Handler1<T>, "allowToJSON" | "match" | "write">;
type WriteRouter1 = (value: any) => WriteHandler1<any>;

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

const routeBoolean: WriteRouter1 = (v: boolean) => (v ? hTrue : hFalse);

const hBooleanObject: WriteHandler1<boolean | Boolean> = {
    allowToJSON: true,

    write: (buf, value, next) => {
        const bool = Boolean(+value);
        return routeBoolean(bool).write(buf, bool, next);
    },
};

/**
 * number
 */

const routeNumber: WriteRouter1 = (v: number) => ((v | 0) == v) ? ((0 <= v && v <= 9) ? hNumber0 : hInt32) : (isFinite(v) ? hDouble : hNull);

const hNumberObject: WriteHandler1<number | Number> = {
    allowToJSON: true,

    write: (buf, value, next) => {
        const num = Number(value);
        return routeNumber(num).write(buf, num, next);
    },
};

/**
 * hUtf8String has better performance on short string.
 * hTwoByteString has better performance on long string.
 */

const routeString: WriteRouter1 = (v: string) => ((v.length <= 53) ? hString : hWideString);

const hStringObject: WriteHandler1<string | String> = {
    allowToJSON: true,

    write: (buf, value, next) => {
        const str = String(value);
        return routeString(str).write(buf, str, next)
    },
};

/**
 * default router for `encode()`.
 * add missing handlers via `handler` option.
 */

const routeType: WriteRouter1 = value => {
    switch (typeof value) {
        case "number":
            return routeNumber(value);
        case "string":
            return routeString(value);
        case "object":
            if (Array.isArray(value)) return hArrayBegin;
            if (value === null) return hNull;
            // Binary is a wrapper for Uint8Array
            if (value instanceof Binary) return hBinary;
            break;
        case "boolean":
            return routeBoolean(value);
        case "bigint":
            return hBigInt;
    }
};

export const routeObject: WriteRouter1 = value => {
    if ("object" !== typeof value) return;

    let handler: WriteHandler1<any>;

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
    } else {
        handler = hObjectBegin;
    }

    return handler;
};

const initDefault = (): WriteRoute => {
    const route = new WriteRoute(routeType);

    route.add(hArrayBuffer);
    route.add(hArrayBufferView, ArrayBuffer.isView);

    return route;
};

export const defaultWriteRoute = initDefault();
