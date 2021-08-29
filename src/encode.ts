/**
 * @see https://github.com/kawanet/binjson
 */

import {WriteBuf} from "./write-buf";
import {Driver} from "./driver";
import {Tag} from "./enum";
import {routeObject} from "./write-route";

export function encode(driver: Driver, value: any, buf: WriteBuf): Uint8Array {
    const {writeRouter1, writeRouterX} = driver;
    const start = buf;
    const stack: object[] = [];

    const next = (value: any, key?: string): boolean => {
        // pickup a valid handler for the value
        let handler1 = writeRouter1(value);
        const isObject = value && ("object" === typeof value);
        const handlerX = !handler1 && isObject && writeRouterX && writeRouterX(value);
        if (!handler1 && !handlerX) {
            handler1 = routeObject(value);
            if (!handler1) return false; // fail
        }

        if (isObject) {
            // circular structure
            for (let v of stack) {
                if (v === value) throw new TypeError("Converting circular structure to binjson");
            }

            // isNotInternalCall = (key !== null)
            if ((key !== null) && handler1 && handler1.allowToJSON && "function" === typeof value.toJSON) {
                value = value.toJSON(String(key));
                return next(value, key);
            }

            stack.push(value);
        }

        // perform encoding
        if (handlerX) {
            buf.prepare(5);
            buf.tag(Tag.kExtension);
            buf.writeI32(handlerX.subtag);
            handlerX.write(value, next);
        } else {
            // request 10 byte buffer available at least
            buf = buf.prepare(10);
            handler1.write(buf, value, next);
        }

        // release
        if (isObject) stack.pop();

        // success
        return true;
    };

    if (next(value, "")) return start.publish();
}
