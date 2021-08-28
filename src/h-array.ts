/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";
import * as M from "./h-misc";

const {hNull} = M;

/**
 * Array
 */

export const hBeginDenseJSArray: binjson.Handler<any[]> = {
    tag: Tag.kArrayBegin,
    allowToJSON: true,

    read: (buf, _, next) => {
        buf.pos++;
        const array: any[] = [];

        while (1) {
            if (buf.tag() === Tag.kArrayEnd) {
                buf.pos++;
                break;
            }
            array.push(next());
        }

        return array;
    },

    write: (buf, array, next) => {
        buf.tag(Tag.kArrayBegin);
        buf.pos++;

        let idx = 0;
        for (let item of array) {
            next(item, idx++, array) || hNull.write(buf, null, next);
        }

        hEndDenseJSArray.write(buf, null, next);
    }
};

export const hEndDenseJSArray: binjson.Handler<unknown> = {
    tag: Tag.kArrayEnd,

    read: (buf) => {
        throw new SyntaxError(`Invalid sequence: 0x${(buf.tag()).toString(16)}`);
    },

    write: (buf) => {
        buf = buf.prepare(2);
        buf.tag(Tag.kArrayEnd);
        buf.pos++;
    },
};
