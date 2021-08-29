/**
 * @see https://github.com/kawanet/binjson
 */

import {Tag} from "./enum";
import {ReadBuf} from "./read-buf";
import {Driver} from "./driver";

export function decode(driver: Driver, buf: ReadBuf): any {
    const {readRouter1, readRouterX} = driver;

    const next = (): any => {
        const tag = buf.tag();
        const handler = readRouter1(tag);
        if (handler) {
            return handler.read(buf, tag, next);
        }

        if (tag === Tag.kExtension) {
            const subtag = buf.readI32() >>> 0;
            const handlerX = readRouterX(subtag);
            if (handlerX) {
                return handlerX.read(subtag, next);
            }
        }
    };

    return next();
}
