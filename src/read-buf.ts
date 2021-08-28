/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

export class ReadBuf implements binjson.ReadBuf {
    data: Uint8Array;
    protected view: DataView;
    pos = 0;

    constructor(buf: Uint8Array) {
        this.data = buf;
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.length);
    }

    tag(): number {
        return this.data[this.pos];
    }

    readI32(): number {
        const {pos} = this;
        this.pos += 5;
        return this.view.getInt32(pos + 1);
    }

    readF64(): number {
        const {pos} = this;
        this.pos += 9;
        return this.view.getFloat64(pos + 1);
    }

    readData16<T>(fn: (data: Uint8Array, offset: number, length: number) => T): T {
        const buf = this;
        const {pos} = buf;
        const length = buf.view.getUint16(pos + 1);
        buf.pos += 3 + length;
        return fn(buf.data, pos + 3, length);
    }

    readData32<T>(fn: (data: Uint8Array, offset: number, length: number) => T): T {
        const buf = this;
        const {pos} = buf;
        const length = buf.view.getUint32(pos + 1);
        buf.pos += 5 + length;
        return fn(buf.data, pos + 5, length);
    }

    readView16<T>(fn: (view: DataView, offset: number, length: number) => T): T {
        const buf = this;
        const {pos} = buf;
        const length = this.view.getUint16(pos + 1);
        this.pos += 3 + length;
        return fn(buf.view, pos + 3, length);
    }

    readView32<T>(fn: (view: DataView, offset: number, length: number) => T): T {
        const buf = this;
        const {pos} = buf;
        const length = this.view.getUint32(pos + 1);
        this.pos += 5 + length;
        return fn(buf.view, pos + 5, length);
    }
}
