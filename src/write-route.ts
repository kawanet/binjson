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

export type WriteHandler<T> = binjson.WriteHandler<T>;
export type WriteRouter = (value: any) => binjson.WriteHandler<any>;

const {hArrayBegin} = A;
const {hFalse, hTrue} = B;
const {hNull} = M;
const {hBigInt, hDouble, hInt32, hNumber0} = N;
const {hObjectBegin} = O;
const {hString} = S;
const {hArrayBufferView} = T;
const {hWideString} = W;

const rBoolean: WriteRouter = (v: boolean) => (v ? hTrue : hFalse);

const hBooleanObject: WriteHandler<boolean | Boolean> = {
    allowToJSON: true,
    write: (buf, value, next) => {
        const bool = Boolean(+value);
        return rBoolean(bool).write(buf, bool, next);
    },
};

const rNumber: WriteRouter = (v: number) => ((v | 0) == v) ? ((0 <= v && v <= 9) ? hNumber0 : hInt32) : (isFinite(v) ? hDouble : hNull);

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

const rString: WriteRouter = (v: string) => ((v.length <= 10) ? hString : hWideString);

const hStringObject: WriteHandler<string | String> = {
    allowToJSON: true,
    write: (buf, value, next) => {
        const str = String(value);
        return rString(str).write(buf, str, next)
    },
};

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

export class WriteRoute {
    route: WriteRouter;

    add(handler: WriteHandler<any> | WriteHandler<any>[]): void {
        if (Array.isArray(handler)) {
            return handler.slice().reverse().forEach(h => this.add(h));
        }

        if (!handler.match) return;
        this.route = ADD(handler, this.route);
    }

    router(base?: WriteRouter): WriteRouter {
        return MERGE(this.route, base);
    }
}

const ADD = (handler: WriteHandler<any>, router: WriteRouter): WriteRouter => {
    if (router) {
        return (value) => handler.match(value) ? handler : router(value);
    } else {
        return (value) => handler.match(value) ? handler : null;
    }
};

const MERGE = (r1: WriteRouter, r2: WriteRouter): WriteRouter => {
    if (r1 && r2) return (value) => (r1(value) || r2(value));
    return r1 || r2;
};

