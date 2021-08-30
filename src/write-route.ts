/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

type Handler<T> = binjson.Handler<T>;
type Handler1<T> = binjson.Handler1<T, any>;
type WriteHandler1<T> = Pick<Handler1<T>, "allowToJSON" | "match" | "write">;
type HandlerX<T> = binjson.HandlerX<T, any>;

export type WriteRouter1 = (value: any) => WriteHandler1<any>;
export type WriteRouterX = (value: any) => HandlerX<any>;

const isHandler1 = (handler: any): handler is Handler1<any> => !!handler?.tag;
const isHandlerX = (handler: any): handler is HandlerX<any> => !!handler?.subtag;

export class WriteRoute {
    constructor(private wr1?: WriteRouter1, private wrX?: WriteRouterX) {
        //
    }

    add(handler: Handler<any> | Handler<any>[], filter?: (value: any) => boolean): void {
        if (filter) {
            const subRoute = new WriteRoute();
            subRoute.add(handler);
            const r1 = subRoute.router1();
            const rX = subRoute.routerX();
            if (r1) this.wr1 = MERGE1(value => (filter(value) && r1(value)), this.wr1);
            if (rX) this.wrX = MERGEX(value => (filter(value) && rX(value)), this.wrX);
            return;
        }

        if (Array.isArray(handler)) {
            return handler.slice().reverse().forEach(h => this.add(h));
        }

        if (!handler.match) return;

        if (isHandler1(handler)) {
            this.wr1 = ADD1(handler, this.wr1);
        }

        if (isHandlerX(handler)) {
            this.wrX = ADDX(handler, this.wrX);
        }
    }

    router1(base?: WriteRouter1): WriteRouter1 {
        return MERGE1(this.wr1, base);
    }

    routerX(base?: WriteRouterX): WriteRouterX {
        return MERGEX(this.wrX, base);
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
