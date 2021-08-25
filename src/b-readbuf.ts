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
        const size = this.data[pos + 1];
        if (size !== 4) throw new SyntaxError(`Invalid packet size: 4 != ${size}`);
        this.pos += 6;
        return this.view.getInt32(pos + 2, true);
    }

    readF64(): number {
        const {pos} = this;
        const size = this.data[pos + 1];
        if (size !== 8) throw new SyntaxError(`Invalid packet size: 8 != ${size}`);
        this.pos += 10;
        return this.view.getFloat64(pos + 2, true);
    }

    readData<T>(fn: (data: Uint8Array, offset: number, length: number) => T): T {
        return read(this, (offset, length) => fn(this.data, offset, length));
    }

    readView<T>(fn: (view: DataView, offset: number, length: number) => T): T {
        return read(this, (offset, length) => fn(this.view, offset, length));
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
