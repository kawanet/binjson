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
            if (handler) return handler.read(buf, tag, next);
        };

        return next();
    }
}

function updateRouter(router: ReadRouter, options: binjson.Options): ReadRouter {
    if (!router) router = defaultRouter;

    if (options) {
        const {handler} = options;

        if (Array.isArray(handler)) {
            handler?.slice().reverse().forEach(h => (router = addHandler(router, h)));
        } else {
            router = addHandler(router, handler);
        }
    }

    return router;
}

function addHandler(router: ReadRouter, handler: binjson.ReadHandler<any>): ReadRouter {
    let tag = handler?.tag;
    const list: (typeof handler)[] = new Array(256);
    if (Array.isArray(tag)) {
        for (const t of tag) list[t & 255] = handler;
    } else if (tag != null) {
        list[tag & 255] = handler;
    }
    return t => (list[t] || router(t));
}
