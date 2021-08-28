/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

/**
 * UTF16
 */

export const hWideString: binjson.Handler<string> = {
    tag: [Tag.kWideString16, Tag.kWideString32],

    read: (buf, tag) => {
        if (tag === Tag.kWideString16) {
            return buf.readView16(readString);
        } else if (tag === Tag.kWideString32) {
            return buf.readView32(readString);
        }
    },

    match: (value) => ("string" === typeof value),

    write: (buf, value) => {
        const length = value.length << 1;
        buf = buf.prepare(5 + length);
        if (length < 0x10000) {
            buf.tag(Tag.kWideString16);
            buf.writeView16(length, (array, offset) => writeString(array, offset, value));
        } else {
            buf.tag(Tag.kWideString32);
            buf.writeView32(length, (array, offset) => writeString(array, offset, value));
        }
    },
};

const readString = (view: DataView, offset: number, length: number): string => {
    length >>= 1;

    if (!length) {
        return "";
    } else if (length === 1) {
        return String.fromCharCode(view.getUint16(offset));
    } else {
        let string = "";
        let size = 256;
        let chunk: number[];
        while (length > 0) {
            if (size > length) {
                size = length;
                chunk = new Array(size);
            } else if (!chunk) {
                chunk = new Array(size);
            }
            for (let i = 0; i < size; i++) {
                chunk[i] = view.getUint16(offset);
                offset += 2;
            }
            string += String.fromCharCode.apply(String, chunk);
            length -= size;
        }
        return string;
    }
}

const writeString = (view: DataView, offset: number, string: string): number => {
    const {length} = string;
    let idx = 0;
    while (idx < length) {
        view.setUint16(offset, string.charCodeAt(idx++));
        offset += 2;
    }
    return idx << 1;
};