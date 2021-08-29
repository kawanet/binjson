/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

export const hBinary: binjson.Handler1<Uint8Array> = {
    tag: [Tag.kBinary16, Tag.kBinary32],

    read: (buf, tag) => {
        if (tag === Tag.kBinary16) {
            return buf.readData16(toBinary);
        } else if (tag === Tag.kBinary32) {
            return buf.readData32(toBinary);
        }
    },

    match: value => (value instanceof Binary),

    write: (buf, value) => {
        const {byteLength} = value;
        buf.prepare(5);

        if (byteLength < 0x10000) {
            buf.tag(Tag.kBinary16);
            buf.insertData16(value);
        } else {
            buf.tag(Tag.kBinary32);
            buf.insertData32(value);
        }
    },
};

/**
 * Wrapper class for Uint8Array
 */

export class Binary extends Uint8Array {
    //
}

/**
 * Binary.from()
 */

export function toBinary(view: ArrayBufferView, offset?: number, length?: number) {
    const {buffer, byteOffset, byteLength} = view;
    offset |= 0;
    if (length == null) length = byteLength - offset;
    return new Binary(buffer, byteOffset + offset, length);
}
