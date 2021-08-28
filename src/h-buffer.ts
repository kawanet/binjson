/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {SubTag, Tag} from "./enum";

/**
 * Node.js Buffer
 */

export const hNodeBuffer: binjson.Handler<Buffer> = {
    tag: Tag.kNodeBuffer,
    subtag: SubTag.Buffer,

    read: (buf, tag) => {
        const subtag = buf.readI32() >>> 0;
        if (subtag !== SubTag.Buffer) return;

        const cb = (array: Uint8Array, offset: number, length: number) => {
            return Buffer.from(array.buffer, array.byteOffset + offset, length);
        };

        tag = buf.tag();
        if (tag === Tag.kBinary16) {
            return buf.readData16(cb);
        } else if (tag === Tag.kBinary32) {
            return buf.readData32(cb);
        }
    },

    match: value => Buffer.isBuffer(value),

    write: (buf, value) => {
        buf.tag(Tag.kNodeBuffer);
        buf.writeI32(SubTag.Buffer);

        const {buffer, byteLength, byteOffset} = value;
        const data = Buffer.from(buffer, byteOffset, byteLength);

        if (byteLength < 0x10000) {
            buf.tag(Tag.kBinary16);
            buf.insertData16(data);
        } else {
            buf.tag(Tag.kBinary32);
            buf.insertData32(data);
        }
    }
};
