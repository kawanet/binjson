/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

/**
 * Node.js Buffer
 */

export const hNodeBuffer: binjson.Handler<Buffer> = {
    tag: Tag.kNodeBuffer,

    read: (buf) => {
        return buf.readData32((array, offset, length) => {
            return Buffer.from(array.buffer, array.byteOffset + offset, length);
        });
    },

    match: value => Buffer.isBuffer(value),

    write: (buf, value) => {
        buf.tag(Tag.kNodeBuffer);
        const {buffer, byteLength, byteOffset} = value;
        buf.insertData(Buffer.from(buffer, byteOffset, byteLength));
    }
};
