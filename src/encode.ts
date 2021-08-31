/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {WriteBuf} from "./write-buf";
import {Driver} from "./driver";
import {Tag} from "./enum";
import {objectRouter} from "./write-router";

export function encode(driver: Driver, value: any, buf: WriteBuf): Uint8Array {
    const {writeRouter1, writeRouterX} = driver;
    const start = buf;
    const stack: object[] = [];

    const next = (value: any, key?: string): boolean => {
        // pickup a valid handler for the value
        let handler1 = writeRouter1(value);
        let handlerX: binjson.HandlerX<any, any>;

        if (!handler1) {
            // find handlerX for object
            if (writeRouterX) handlerX = writeRouterX(value);

            // find another handler1 for object
            if (!handlerX) handler1 = objectRouter(value);

            // fail if both handler1/X are not found for object
            if (!handler1 && !handlerX) return false;
        }

        const native = (handler1 && handler1.native);

        if (native) {
            // detect circular structure reduced every 8 layers
            const depth = stack.length;
            if ((depth & 7) === 0) {
                for (let i = 0; i < depth; i++) {
                    if (stack[i] === value) throw new TypeError("Converting circular structure to binjson");
                }
            }

            // only Array and object parent handlers will give non-null key
            if ((key != null)) {
                // value has toJSON method
                if (("function" === typeof value.toJSON)) {
                    value = value.toJSON(String(key));
                    return next(value, key);
                }
            }

            stack.push(value);
        }

        // request 9 byte buffer available at least
        buf = buf.prepare(9);

        // perform encoding
        if (handlerX) {
            buf.tag(Tag.kExtension);
            buf.writeI32(handlerX.subtag);
            handlerX.write(value, next);
        } else {
            handler1.write(buf, value, next);
        }

        // release
        if (native) {
            stack.pop();
        }

        // success
        return true;
    };

    if (next(value, "")) return start.publish();
}
