/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

type Handler = binjson.Handler<any>;
type Handler1 = binjson.Handler1<any, any>;
type HandlerX = binjson.HandlerX<any, any>;

export type ReadRouter1 = (tag: number) => binjson.Handler1<any, any>;
export type ReadRouterX = (tagX: number) => binjson.HandlerX<any, any>;
type Router1Index = Handler1[];
type RouterXIndex = { [key: string]: HandlerX };

const isHandler1 = (handler: any): handler is Handler1 => !!(handler && handler.tag && handler.read);
const isHandlerX = (handler: any): handler is HandlerX => !!(handler && handler.tagX && handler.decode);

export interface IReadDriver {
    router1?: ReadRouter1;
    routerX?: ReadRouterX;
}

export class ReadDriver implements IReadDriver {
    router1?: ReadRouter1;
    routerX?: ReadRouterX;
    private i1: Router1Index;
    private iX: RouterXIndex;

    constructor(base?: IReadDriver) {
        this.router1 = base?.router1;
        this.routerX = base?.routerX;
    }

    export(target: IReadDriver): void {
        target.router1 = this.router1;
        target.routerX = this.routerX;
    }

    add(handler: Handler | (Handler | Handler[])[]): void {
        if (Array.isArray(handler)) {
            return handler.slice().reverse().forEach(h => this.add(h));
        }

        if (isHandler1(handler)) {
            this.add1(handler.tag, handler);
        }

        if (isHandlerX(handler)) {
            this.addX(handler.tagX, handler);
        }
    }

    private add1(tag: number | number[], handler: Handler1): void {
        if (Array.isArray(tag)) {
            tag.forEach(t => this.add1(t, handler));
        } else if (tag != null) {
            if (!this.i1) {
                this.router1 = GEN1((this.i1 = []), this.router1);
            }
            this.i1[tag & 255] = handler;
        }
    }

    private addX(tagX: number | number[], handler: HandlerX): void {
        if (Array.isArray(tagX)) {
            tagX.forEach(t => this.addX(t, handler));
        } else if (tagX != null) {
            if (!this.iX) {
                this.routerX = GENX((this.iX = {}), this.routerX);
            }
            this.iX[tagX >>> 0] = handler;
        }
    }
}

const GEN1 = (index: Router1Index, base: ReadRouter1): ReadRouter1 => {
    if (base) {
        return tag => (index[tag] || base(tag));
    } else {
        return tag => index[tag];
    }
};

const GENX = (index: RouterXIndex, base: ReadRouterX): ReadRouterX => {
    if (base) {
        return tag => (index[tag >>> 0] || base(tag));
    } else {
        return tag => index[tag >>> 0];
    }
};
