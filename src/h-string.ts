/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

/**
 * UTF8
 */

export const hString: binjson.Handler<string> = {
    tag: Tag.kString16,

    read: (buf) => buf.readData(readString),

    match: (value) => ("string" === typeof value),

    write: (buf, value) => {
        const {length} = value;
        buf = buf.prepare(8 + length * 3);
        buf.tag(Tag.kString16);
        if (!length) return buf.pos += 2;
        buf.writeData(length * 3, (array, offset) => writeString(array, offset, value));
    },
};

const readString = (buffer: Uint8Array, offset: number, length: number): string => {
    if (length === 0) {
        return "";
    } else if (length === 1) {
        const c = buffer[offset];
        if (c < 128) return String.fromCharCode(c);
    }

    let index = offset | 0;
    const end = offset + length;
    let string = '';
    let chr = 0;

    while (index < end) {
        chr = buffer[index++];
        if (chr < 128) {
            string += String.fromCharCode(chr);
        } else {
            if ((chr & 0xE0) === 0xC0) {
                // 2 bytes
                chr = (chr & 0x1F) << 6 |
                    (buffer[index++] & 0x3F);

            } else if ((chr & 0xF0) === 0xE0) {
                // 3 bytes
                chr = (chr & 0x0F) << 12 |
                    (buffer[index++] & 0x3F) << 6 |
                    (buffer[index++] & 0x3F);

            } else if ((chr & 0xF8) === 0xF0) {
                // 4 bytes
                chr = (chr & 0x07) << 18 |
                    (buffer[index++] & 0x3F) << 12 |
                    (buffer[index++] & 0x3F) << 6 |
                    (buffer[index++] & 0x3F);

                if (chr >= 0x010000) {
                    // A surrogate pair
                    chr -= 0x010000;
                    string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
                    continue;
                }
            }
            string += String.fromCharCode(chr);
        }
    }

    return string;
};

const writeString = (buffer: Uint8Array, start: number, string: string): number => {
    let index = start;
    const length = string.length;
    let chr = 0;
    let idx = 0;
    while (idx < length) {
        chr = string.charCodeAt(idx++);

        if (chr < 128) {
            buffer[index++] = chr;
        } else if (chr < 0x800) {
            // 2 bytes
            buffer[index++] = 0xC0 | (chr >>> 6);
            buffer[index++] = 0x80 | (chr & 0x3F);
        } else if (chr < 0xD800 || chr > 0xDFFF) {
            // 3 bytes
            buffer[index++] = 0xE0 | (chr >>> 12);
            buffer[index++] = 0x80 | ((chr >>> 6) & 0x3F);
            buffer[index++] = 0x80 | (chr & 0x3F);
        } else {
            // 4 bytes - surrogate pair
            chr = (((chr - 0xD800) << 10) | (string.charCodeAt(idx++) - 0xDC00)) + 0x10000;
            buffer[index++] = 0xF0 | (chr >>> 18);
            buffer[index++] = 0x80 | ((chr >>> 12) & 0x3F);
            buffer[index++] = 0x80 | ((chr >>> 6) & 0x3F);
            buffer[index++] = 0x80 | (chr & 0x3F);
        }
    }
    return index - start;
};
