/**
 * @see https://github.com/kawanet/binjson
 */

import {Tag} from "./enum";
import {ReadBuf} from "./read-buf";
import {IReadDriver} from "./read-driver";

export function decode(driver: IReadDriver, buf: ReadBuf): any {
    const {router1, routerX} = driver;

    const next = (): any => {
        const tag = buf.tag();
        const handler1 = router1(tag);
        if (handler1) {
            return handler1.read(buf, tag, next);
        }

        if (tag === Tag.kExtension) {
            const tagX = buf.readI32() >>> 0;
            const handlerX = routerX(tagX);
            if (handlerX) {
                return handlerX.decode(next());
            }
        }
    };

    return next();
}
