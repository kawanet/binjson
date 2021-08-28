/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {PacketType as P} from "./enum";

export class ReadBuf implements binjson.ReadBuf {
    data: Uint8Array;
    view: DataView;
    pos = 0;

    constructor(buf: Uint8Array) {
        this.data = buf;
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.length);
    }

    tag(): number {
        return this.data[this.pos];
    }

    count(): number {
        return read(this);
    }

    readI32(): number {
        const {pos} = this;
        this.pos += 5;
        return this.view.getInt32(pos + 1, true);
    }

    readF64(): number {
        const {pos} = this;
        this.pos += 9;
        return this.view.getFloat64(pos + 1, true);
    }

    readData32<T>(fn: (data: Uint8Array, offset: number, length: number) => T): T {
        const buf = this;
        const {pos} = buf;
        const length = buf.view.getUint32(pos + 1);
        buf.pos += 5 + length;
        return fn(buf.data, pos + 5, length);
    }

    readView32<T>(fn: (view: DataView, offset: number, length: number) => T): T {
        const buf = this;
        const {pos} = buf;
        const length = this.view.getUint32(pos + 1);
        this.pos += 5 + length;
        return fn(buf.view, pos + 5, length);
    }
}

type ReadCallback<T> = (offset: number, length: number) => T;

interface IRead {
    <T>(buf: ReadBuf, fn: ReadCallback<T>): T;

    // returns size only
    (buf: ReadBuf): number;
}

const read: IRead = <T>(buf: ReadBuf, cb?: ReadCallback<T>) => {
    const {pos} = buf;
    const layout = buf.data[pos + 1];
    let size = layout & P.sizeMask;
    let offset: number;
    if (size === P.payload32) {
        size = buf.view.getInt32(pos + 2);
        offset = 6;
    } else if (size === P.payload16) {
        size = buf.view.getUint16(pos + 2);
        offset = 4;
    } else {
        offset = 2;
    }

    if (cb) {
        // ReadCallback
        const result = cb(pos + offset, size);
        buf.pos += offset + size;
        return result;
    } else {
        // count()
        buf.pos += offset;
        return size;
    }
};
