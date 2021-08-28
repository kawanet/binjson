/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";
import {hNull} from "./h-misc";

/**
 * Array
 */

export const hArrayBegin: binjson.Handler<any[]> = {
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

        hArrayEnd.write(buf, null, next);
    }
};

export const hArrayEnd: binjson.Handler<unknown> = {
    tag: Tag.kArrayEnd,

    read: (buf) => {
        throw new SyntaxError(`Invalid sequence: 0x${(buf.tag()).toString(16)}`);
    },

    write: (buf) => {
        buf = buf.prepare(1);
        buf.tag(Tag.kArrayEnd);
        buf.pos++;
    },
};
