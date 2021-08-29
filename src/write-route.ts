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
import * as X from "./h-binary";
import {hArrayBufferView} from "./h-typedarray";
import {Binary} from "./h-binary";

type Handler<T> = binjson.Handler<T>;
type Handler1<T> = binjson.Handler1<T>;
type WriteHandler1<T> = Pick<Handler1<T>, "allowToJSON" | "match" | "write">;
type HandlerX<T> = binjson.HandlerX<T>;

export type WriteRouter1 = (value: any) => WriteHandler1<any>;
export type WriteRouterX = (value: any) => HandlerX<any>;

const {hArrayBegin} = A;
const {hFalse, hTrue} = B;
const {hNull} = M;
const {hBigInt, hDouble, hInt32, hNumber0} = N;
const {hObjectBegin} = O;
const {hString} = S;
const {hWideString} = W;
const {hBinary} = X;

const isHandler1 = (handler: any): handler is Handler1<any> => !!handler?.tag;
const isHandlerX = (handler: any): handler is HandlerX<any> => !!handler?.subtag;

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

const routeString: WriteRouter1 = (v: string) => ((v.length <= 10) ? hString : hWideString);

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
    if ("object" === typeof value) {
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
    }
};

export class WriteRoute {
    constructor(private route?: WriteRouter1, private routeX?: WriteRouterX) {
        //
    }

    add(handler: Handler<any> | (Handler<any> | Handler<any>[])[]): void {
        if (Array.isArray(handler)) {
            return handler.slice().reverse().forEach(h => this.add(h));
        }

        if (!handler.match) return;

        if (isHandler1(handler)) {
            this.route = ADD1(handler, this.route);
        }

        if (isHandlerX(handler)) {
            this.routeX = ADDX(handler, this.routeX);
        }
    }

    router1(base?: WriteRouter1): WriteRouter1 {
        return MERGE1(this.route, base);
    }

    routerX(base?: WriteRouterX): WriteRouterX {
        return MERGEX(this.routeX, base);
    }
}

const ADD1 = (handler: Handler1<any>, router: WriteRouter1): WriteRouter1 => {
    if (router) {
        return (value) => handler.match(value) ? handler : router(value);
    } else {
        return (value) => handler.match(value) ? handler : null;
    }
};

const ADDX = (handler: HandlerX<any>, router: WriteRouterX): WriteRouterX => {
    if (router) {
        return (value) => handler.match(value) ? handler : router(value);
    } else {
        return (value) => handler.match(value) ? handler : null;
    }
};

const MERGE1 = (r1: WriteRouter1, r2: WriteRouter1): WriteRouter1 => {
    if (r1 && r2) return (value) => (r1(value) || r2(value));
    return r1 || r2;
};

const MERGEX = (r1: WriteRouterX, r2: WriteRouterX): WriteRouterX => {
    if (r1 && r2) return (value) => (r1(value) || r2(value));
    return r1 || r2;
};

export const defaultWriteRoute = new WriteRoute(routeType);

defaultWriteRoute.add([
    hArrayBufferView
]);
