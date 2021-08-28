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

    read: (buf) => buf.readView32(readString),

    match: (value) => ("string" === typeof value),

    write: (buf, value) => {
        const {length} = value;
        const bytes = length << 1;
        buf = buf.prepare(6 + bytes);
        buf.tag(Tag.kWideString16);
        if (!length) return buf.pos += 2;

        buf.writeView32(bytes, (view, offset) => writeString(view, offset, value));
    },
};

const readString = (view: DataView, offset: number, length: number): string => {
    length >>= 1;

    if (!length) {
        return "";
    } else if (length === 1) {
        return String.fromCharCode(view.getUint16(offset, true));
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
                chunk[i] = view.getUint16(offset, true);
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
        view.setUint16(offset, string.charCodeAt(idx++), true);
        offset += 2;
    }
    return idx << 1;
};