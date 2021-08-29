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
import {hArrayBufferView} from "./h-typedarray";
import {hBigInt, hDouble, hInt32, hNumber0} from "./h-number";
import {hFalse, hTrue} from "./h-boolean";
import {hObjectBegin, hObjectEnd} from "./h-object";

type Handler = binjson.Handler<any>;
type Handler1 = binjson.Handler1<any>;
type HandlerX = binjson.HandlerX<any>;

export type ReadRouter1 = (tag: number) => binjson.Handler1<any>;
export type ReadRouterX = (subtag: number) => binjson.HandlerX<any>;

export const handlers: binjson.Handlers = {
    Buffer: hBuffer,
    Date: hDate,
    RegExp: hRegExp,
    UTF8: hString,
    UTF16: hWideString,
    Undefined: hUndefined,
};

const isHandlerX = (handler: any): handler is HandlerX => !!handler?.subtag;
const isHandler1 = (handler: any): handler is Handler1 => !!handler?.tag;

export class ReadRoute {
    private readers: Handler1[] = [];
    private extended: { [key: string]: HandlerX } = {};

    add(handler: Handler | (Handler | Handler[])[]): void {
        if (Array.isArray(handler)) {
            handler.slice().reverse().forEach(h => this.add(h));
        } else {
            if (isHandlerX(handler)) {
                this.addSubTag(handler.subtag, handler);
            }
            if (isHandler1(handler)) {
                this.addTag(handler.tag, handler);
            }
        }
    }

    private addTag(tag: number | number[], handler: Handler1): void {
        if (Array.isArray(tag)) {
            tag.forEach(t => this.addTag(t, handler));
        } else if (tag != null) {
            this.readers[tag & 255] = handler;
        }
    }

    private addSubTag(subtag: number | number[], handler: HandlerX): void {
        if (Array.isArray(subtag)) {
            subtag.forEach(t => this.addSubTag(t, handler));
        } else if (subtag != null) {
            this.extended[subtag >>> 0] = handler;
        }
    }

    /**
     * ReadRouter for Tag
     */

    router1(base?: ReadRouter1): (tag: number) => Handler1 {
        const {readers} = this;
        if (base) {
            return tag => (readers[tag] || base(tag));
        } else {
            return tag => readers[tag];
        }
    }

    /**
     * ReadRouter for SubTag
     */

    routerX(base?: ReadRouterX): (subtag: number) => HandlerX {
        const {extended} = this;
        if (base) {
            return tag => (extended[tag >>> 0] || base(tag));
        } else {
            return tag => extended[tag >>> 0];
        }
    }
}

/**
 * default router for `decode()`.
 */

export const defaultReadRoute = new ReadRoute();

defaultReadRoute.add([
    hArrayBegin,
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
