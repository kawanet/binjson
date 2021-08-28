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

    read: (buf) => {
        const subtag = buf.readI32() >>> 0;
        if (subtag !== SubTag.Buffer) return;

        return buf.readData32((array, offset, length) => {
            return Buffer.from(array.buffer, array.byteOffset + offset, length);
        });
    },

    match: value => Buffer.isBuffer(value),

    write: (buf, value) => {
        buf.tag(Tag.kNodeBuffer);
        buf.writeI32(SubTag.Buffer);

        buf.tag(Tag.kBinary32);
        const {buffer, byteLength, byteOffset} = value;
        buf.insertData(Buffer.from(buffer, byteOffset, byteLength));
    }
};
