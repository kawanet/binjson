/**
 * @see https://github.com/kawanet/binjson
 */

import {ReadBuf} from "./read-buf";
import {Driver} from "./driver";

export function decode(driver: Driver, buf: ReadBuf): any {
    const {readRouter} = driver;

    const next = (): any => {
        const tag = buf.tag();
        const handler = readRouter(tag);
        if (handler) return handler.read(buf, tag, next);
    };

    return next();
}
