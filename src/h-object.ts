/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";
import {hUndefined} from "./h-misc";

/**
 * Object
 */

export const hObjectBegin: binjson.Handler1<object, any> = {
    tag: Tag.kObjectBegin,
    native: true,

    read: (buf, _, next) => {
        buf.pos++;

        const object: { [key: string]: any } = {};

        while (buf.tag() !== Tag.kObjectEnd) {
            const val = next();
            const key = next();
            if (key != null) object[key] = val;
        }

        buf.pos++;
        return object;
    },

    write: (buf, value: { [key: string]: any }, next) => {
        buf.tag(Tag.kObjectBegin);
        buf.pos++;

        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                if (next(value[key], key)) {
                    if (!next(key)) {
                        hUndefined.write(buf, undefined, next);
                    }
                }
            }
        }

        hObjectEnd.write(buf, null, next);
    }
};

export const hObjectEnd: binjson.Handler1<unknown> = {
    tag: Tag.kObjectEnd,

    read: (buf) => {
        throw new SyntaxError(`Invalid sequence: 0x${(buf.tag()).toString(16)}`);
    },

    write: (buf) => {
        buf = buf.prepare(1);
        buf.tag(Tag.kObjectEnd);
        buf.pos++;
    },
};