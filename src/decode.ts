/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {ReadBuf} from "./b-readbuf";
import {initReadRouter} from "./handler";

const defaultRouter = initReadRouter();

export type ReadRouter = typeof defaultRouter;
type DecodeFn = binjson.IBinJSON<Uint8Array>["decode"];

export function initDecode(options: binjson.Options, router: ReadRouter): DecodeFn {

    router = updateRouter(router, options);

    return (data) => {
        const buf = new ReadBuf(data);

        const next = (): any => {
            const tag = buf.tag();
            const handler = router(tag);
            if (handler) return handler.read(buf, next);
        };

        return next();
    }
}

function updateRouter(router: ReadRouter, options: binjson.Options): ReadRouter {
    if (!router) router = defaultRouter;

    if (options) {
        const {handler, handlers} = options;

        handlers?.slice().reverse().forEach(h => (router = addHandler(router, h)));

        router = addHandler(router, handler);
    }

    return router;
}

function addHandler(router: ReadRouter, handler: binjson.ReadHandler<any>): ReadRouter {
    let tag = handler?.tag;
    if (tag == null) return router;
    tag &= 255;
    return (t) => (tag === t) ? handler : router(t);
}
