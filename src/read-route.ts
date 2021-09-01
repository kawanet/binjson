/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

type Handler = binjson.Handler<any>;
type Handler1 = binjson.Handler1<any, any>;
type HandlerX = binjson.HandlerX<any, any>;

export type ReadRouter1 = (tag: number) => binjson.Handler1<any, any>;
export type ReadRouterX = (subtag: number) => binjson.HandlerX<any, any>;

const isHandlerX = (handler: any): handler is HandlerX => !!handler?.subtag;
const isHandler1 = (handler: any): handler is Handler1 => !!handler?.tag;

export interface ReadDriver {
    readRouter1?: ReadRouter1;
    readRouterX?: ReadRouterX;
}

export class ReadRoute {
    private idx1: Handler1[] = [];
    private idxX: { [key: string]: HandlerX } = {};

    add(handler: Handler | (Handler | Handler[])[]): void {
        if (Array.isArray(handler)) {
            return handler.slice().reverse().forEach(h => this.add(h));
        }

        if (isHandler1(handler)) {
            this.add1(handler.tag, handler);
        }

        if (isHandlerX(handler)) {
            this.addX(handler.subtag, handler);
        }
    }

    private add1(tag: number | number[], handler: Handler1): void {
        if (Array.isArray(tag)) {
            tag.forEach(t => this.add1(t, handler));
        } else if (tag != null) {
            this.idx1[tag & 255] = handler;
        }
    }

    private addX(subtag: number | number[], handler: HandlerX): void {
        if (Array.isArray(subtag)) {
            subtag.forEach(t => this.addX(t, handler));
        } else if (subtag != null) {
            this.idxX[subtag >>> 0] = handler;
        }
    }

    /**
     * ReadRouter for Tag
     */

    router1(base?: ReadRouter1): (tag: number) => Handler1 {
        const {idx1} = this;
        if (base) {
            return tag => (idx1[tag] || base(tag));
        } else {
            return tag => idx1[tag];
        }
    }

    /**
     * ReadRouter for SubTag
     */

    routerX(base?: ReadRouterX): (subtag: number) => HandlerX {
        const {idxX} = this;
        if (base) {
            return tag => (idxX[tag >>> 0] || base(tag));
        } else {
            return tag => idxX[tag >>> 0];
        }
    }
}
