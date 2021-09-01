/**
 * @see https://github.com/kawanet/binjson
 */

import {Tag} from "./enum";
import {ReadBuf} from "./read-buf";
import {ReadDriver} from "./read-route";

export function decode(driver: ReadDriver, buf: ReadBuf): any {
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
                return handlerX.read(next);
            }
        }
    };

    return next();
}
