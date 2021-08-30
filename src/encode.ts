/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
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
        let handlerX: binjson.HandlerX<any, any>;
        const isObject = (("object" === typeof value) && (value !== null));

        if (!handler1) {
            // fail if handler1 is not found for primitives
            if (!isObject) return false;

            // find handlerX for object
            if (writeRouterX) handlerX = writeRouterX(value);

            // find another handler1 for object
            if (!handlerX) handler1 = routeObject(value);

            // fail if both handler1/X are not found for object (this should never happen)
            if (!handler1 && !handlerX) return false;
        }

        if (isObject) {
            // circular structure
            for (let v of stack) {
                if (v === value) throw new TypeError("Converting circular structure to binjson");
            }

            if (handler1 && handler1.allowToJSON) {
                // Only Array and object will give non-null key
                if (key != null) {
                    // value has toJSON method
                    if ("function" === typeof value.toJSON) {
                        value = value.toJSON(String(key));
                        return next(value, key);
                    }
                }
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
