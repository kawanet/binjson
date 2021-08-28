/**
 * @see https://github.com/kawanet/binjson
 */

import {WriteBuf} from "./write-buf";
import {Driver} from "./driver";

export function encode(driver: Driver, value: any, buf: WriteBuf): Uint8Array {
    const {writeRouter} = driver;
    const start = buf;
    const stack: object[] = [];

    const next = (value: any, key?: string): boolean => {
        // pickup a valid handler for the value
        const handler = writeRouter(value);
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

    if (next(value, "")) return start.publish();
}
