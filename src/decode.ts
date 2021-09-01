/**
 * @see https://github.com/kawanet/binjson
 */

import {Tag} from "./enum";
import {ReadBuf} from "./read-buf";
import {IReadDriver} from "./read-driver";

const toHEX = (num: number) => ("number" === typeof num) ? "0x" + num.toString(16) : String(num);

export function decode(driver: IReadDriver, buf: ReadBuf): any {
    const {router1, routerX} = driver;

    const next = (): any => {
        const tag = buf.tag();
        if (tag == null) {
            throw new SyntaxError(`Unexpected end of binjson input`);
        }

        const handler1 = router1(tag);
        if (handler1) {
            return handler1.read(buf, tag, next);
        }

        if (tag !== Tag.kExtension) {
            throw new SyntaxError(`Unexpected tag ${toHEX(tag)} in binjson at position ${buf.pos}`);
        }

        const tagX = buf.readI32() >>> 0;
        const handlerX = routerX(tagX);
        if (!handlerX) {
            throw new SyntaxError(`Unexpected tagX ${toHEX(tagX)} in binjson at position ${buf.pos}`);
        }

        return handlerX.decode(next());
    };

    return next();
}
