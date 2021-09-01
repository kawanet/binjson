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

export interface IWriteDriver {
    router1?: WriteRouter1;
    routerX?: WriteRouterX;
}

export class WriteDriver implements IWriteDriver {
    router1?: WriteRouter1;
    routerX?: WriteRouterX;

    constructor(driver?: IWriteDriver) {
        if (driver) {
            this.export.call(driver, this);
        }
    }

    export(target: IWriteDriver): void {
        target.router1 = this.router1;
        target.routerX = this.routerX;
    }

    add(handler: Handler<any> | Handler<any>[], filter?: (value: any) => boolean): void {
        if (filter) {
            const driver = new WriteDriver();
            driver.add(handler);
            const r1 = driver.router1;
            const rX = driver.routerX;
            if (r1) this.router1 = MERGE1(value => (filter(value) && r1(value)), this.router1);
            if (rX) this.routerX = MERGEX(value => (filter(value) && rX(value)), this.routerX);
            return;
        }

        if (Array.isArray(handler)) {
            return handler.slice().reverse().forEach(h => this.add(h));
        }

        if (isHandler1(handler)) {
            this.router1 = ADD1(handler, this.router1);
        }

        if (isHandlerX(handler)) {
            this.routerX = ADDX(handler, this.routerX);
        }
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
