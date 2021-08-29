/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

/**
 * Wrapper class for Uint8Array
 */

export class Binary {
    protected constructor(private content: Uint8Array) {
        //
    }

    subarray(): Uint8Array {
        return this.content;
    }

    /**
     * Binary.isBinary()
     */

    static isBinary(data: any): boolean {
        return data instanceof Binary;
    }

    /**
     * Binary.from()
     */

    static from(view: ArrayBufferView, offset?: number, length?: number) {
        if (view instanceof Uint8Array && !offset && !length) {
            return new Binary(view);
        }

        const {buffer, byteOffset, byteLength} = view;
        offset |= 0;
        if (length == null) length = byteLength - offset;
        return new Binary(new Uint8Array(buffer, byteOffset + offset, length));
    }
}

export const hBinary: binjson.Handler1<Binary> = {
    tag: [Tag.kBinary16, Tag.kBinary32],

    read: (buf, tag) => {
        if (tag === Tag.kBinary16) {
            return buf.readData16(Binary.from);
        } else if (tag === Tag.kBinary32) {
            return buf.readData32(Binary.from);
        }
    },

    match: Binary.isBinary,

    write: (buf, value) => {
        const data = value.subarray();
        const {byteLength} = data;
        buf.prepare(5);

        if (byteLength < 0x10000) {
            buf.tag(Tag.kBinary16);
            buf.insertData16(data);
        } else {
            buf.tag(Tag.kBinary32);
            buf.insertData32(data);
        }
    },
};
