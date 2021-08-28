/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {defaults} from "./enum";
import {WriteBuf} from "./b-writebuf";
import {initWriteRouter} from "./handler";

const ceil1K = (num: number) => (((num + 1023) >> 10) << 10);

const defaultRouter = initWriteRouter();

export type WriteRouter = typeof defaultRouter;

type NextFn = (value: any, key?: string) => boolean;
type EncodeFn = binjson.IBinJSON<Uint8Array>["encode"];

export function initEncode(options: binjson.Options, router: WriteRouter): EncodeFn {
    let bufSize = defaults.initialBufferSize;

    router = updateRouter(router, options);

    return (value) => {
        let buf = new WriteBuf(bufSize);

        const start = buf;
        const stack: object[] = [];

        let next: NextFn = (value, key): boolean => {
            // pickup a valid handler for the value
            const handler = router(value);
            if (!handler) return false; // fail

            const isObject = value && ("object" === typeof value);
            if (isObject) {
                // circular structure
                for (let v of stack) {
                    if (v === value) throw new TypeError("Converting circular structure to binjson");
                }

                // isNotInternalCall = (key !== null)
                if ((key !== null) && handler.allowToJSON && "function" === typeof value.toJSON) {
                    value = value.toJSON(String(key));
                    return next(value, key);
                }

                stack.push(value);
            }

            // request 10 byte buffer available at least
            buf = buf.prepare(10);

            // perform encoding
            handler.write(buf, value, next);

            // release
            if (isObject) stack.pop();

            // success
            return true;
        };

        next(value, "");
        const out = start.publish();
        if (out) bufSize = ceil1K(out.length);
        return out;
    };
}

/**
 * @private
 */

function updateRouter(router: WriteRouter, options: binjson.Options): WriteRouter {
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

function addHandler(router: WriteRouter, handler: binjson.WriteHandler<any>): WriteRouter {
    if (!handler?.match) return router;
    return (value) => handler.match(value) ? handler : router(value);
}
