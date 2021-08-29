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

export type ReadHandler<T> = binjson.ReadHandler<T>;
export type ReadRouter = (tag: number) => binjson.ReadHandler<any>;

export const handlers: binjson.Handlers = {
    Buffer: hBuffer,
    Date: hDate,
    RegExp: hRegExp,
    UTF8: hString,
    UTF16: hWideString,
    Undefined: hUndefined,
};

export class ReadRoute {
    private readers: ReadHandler<any>[] = [];
    private extended: { [key: string]: ReadHandler<any> } = {};

    add(handler: ReadHandler<any> | ReadHandler<any>[]): void {
        if (Array.isArray(handler)) {
            handler.slice().reverse().forEach(h => this.add(h));
        } else if (handler) {
            this.addTag(handler.tag, handler);
            this.addSubTag(handler.subtag, handler);
        }
    }

    private addTag(tag: number | number[], handler: ReadHandler<any>): void {
        if (Array.isArray(tag)) {
            tag.forEach(t => this.addTag(t, handler));
        } else if (tag != null) {
            this.readers[tag & 255] = handler;
        }
    }

    private addSubTag(subtag: number | number[], handler: ReadHandler<any>): void {
        if (Array.isArray(subtag)) {
            subtag.forEach(t => this.addSubTag(t, handler));
        } else if (subtag != null) {
            this.extended[subtag >>> 0] = handler;
        }
    }

    /**
     * ReadRouter for Tag
     */

    router(base?: ReadRouter): (tag: number) => ReadHandler<any> {
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

    subRouter(base?: ReadRouter): (subtag: number) => ReadHandler<any> {
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
