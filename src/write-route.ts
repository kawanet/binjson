/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

type Handler<T> = binjson.Handler<T>;
type Handler1<T> = binjson.Handler1<T, any>;
type WriteHandler1<T> = Pick<Handler1<T>, "match" | "native" | "write">;
type HandlerX<T> = binjson.HandlerX<T, any>;

export type WriteRouter1 = (value: any) => WriteHandler1<any>;
export type WriteRouterX = (value: any) => HandlerX<any>;

const isHandler1 = (handler: any): handler is Handler1<any> => !!handler?.tag;
const isHandlerX = (handler: any): handler is HandlerX<any> => !!handler?.subtag;

export interface WriteDriver {
    writeRouter1?: WriteRouter1;
    writeRouterX?: WriteRouterX;
}

export class WriteRoute {
    private writeRouter1?: WriteRouter1;
    private writeRouterX?: WriteRouterX;

    constructor(driver?: WriteDriver) {
        if (driver) {
            this.writeRouter1 = driver.writeRouter1;
            this.writeRouterX = driver.writeRouterX;
        }
    }

    add(handler: Handler<any> | Handler<any>[], filter?: (value: any) => boolean): void {
        if (filter) {
            const subRoute = new WriteRoute();
            subRoute.add(handler);
            const r1 = subRoute.router1();
            const rX = subRoute.routerX();
            if (r1) this.writeRouter1 = MERGE1(value => (filter(value) && r1(value)), this.writeRouter1);
            if (rX) this.writeRouterX = MERGEX(value => (filter(value) && rX(value)), this.writeRouterX);
            return;
        }

        if (Array.isArray(handler)) {
            return handler.slice().reverse().forEach(h => this.add(h));
        }

        if (!handler.match) return;

        if (isHandler1(handler)) {
            this.writeRouter1 = ADD1(handler, this.writeRouter1);
        }

        if (isHandlerX(handler)) {
            this.writeRouterX = ADDX(handler, this.writeRouterX);
        }
    }

    router1(): WriteRouter1 {
        return this.writeRouter1;
    }

    routerX(): WriteRouterX {
        return this.writeRouterX;
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
