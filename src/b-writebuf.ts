/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";

const ceil1K = (num: number) => (((num + 1023) >> 10) << 10);

export class WriteBuf implements binjson.WriteBuf {
    protected next?: WriteBuf;
    data: Uint8Array;
    protected view: DataView;
    pos = 0;

    constructor(buf: Uint8Array | number) {
        const u8 = (buf instanceof Uint8Array) ? buf : new Uint8Array(+buf);
        this.pos = 0;
        this.data = u8;
        this.view = new DataView(u8.buffer, u8.byteOffset, u8.length);
    }

    prepare(size: number): WriteBuf {
        let buf: WriteBuf = this;

        // write() may request more longer buffer
        while (buf.next) buf = buf.next;

        const {pos} = buf;
        const {length} = buf.data;
        if (size + pos < length) return buf;
        size = ceil1K(Math.max(size, length << 1));
        return buf.next = new WriteBuf(new Uint8Array(size));
    }

    publish(): Uint8Array {
        let buf: WriteBuf = this;

        while (!buf.pos) {
            buf = buf.next;
            if (!buf) return; // empty
        }

        // single fragment only
        if (!buf.next) {
            return buf.data.subarray(0, buf.pos);
        }

        let total = 0;
        const a = [] as WriteBuf[];
        for (let f = buf; f; f = f.next) {
            total += f.pos;
            a.push(f);
        }
        if (!total) return; // empty

        // multiple fragments
        const combined = new Uint8Array(total);
        let cursor = 0;
        for (let f = buf; f; f = f.next) {
            const {pos} = f;
            if (!pos) continue;
            const item = f.data.subarray(0, pos);
            combined.set(item, cursor);
            cursor += item.length;
        }

        return combined;
    }

    tag(tag: number): void {
        this.data[this.pos] = tag;
    }

    writeI32(value: number): void {
        const {pos} = this;
        this.view.setInt32(pos + 1, value);
        this.pos += 5;
    }

    writeF64(value: number): void {
        const {pos} = this;
        this.view.setFloat64(pos + 1, value);
        this.pos += 9;
    }

    writeData16(length: number, fn: (data: Uint8Array, offset: number) => number): void {
        const buf = this;
        const {pos} = buf;
        length = fn(buf.data, pos + 3);
        buf.view.setUint16(pos + 1, length);
        buf.pos += 3 + length;
    }

    writeData32(length: number, fn: (data: Uint8Array, offset: number) => number): void {
        const buf = this;
        const {pos} = buf;
        length = fn(buf.data, pos + 5);
        buf.view.setUint32(pos + 1, length);
        buf.pos += 5 + length;
    }

    writeView16(length: number, fn: (view: DataView, offset: number) => number): void {
        const buf = this;
        const {pos} = buf;
        length = fn(buf.view, pos + 3);
        buf.view.setUint16(pos + 1, length);
        buf.pos += 3 + length;
    }

    writeView32(length: number, fn: (view: DataView, offset: number) => number): void {
        const buf = this;
        const {pos} = buf;
        length = fn(buf.view, pos + 5);
        buf.view.setUint32(pos + 1, length);
        buf.pos += 5 + length;
    }

    insertData(data: Uint8Array): void {
        let buf: WriteBuf = this;
        const {length} = data;

        buf.view.setUint32(buf.pos + 1, length);
        buf.pos += 5;

        if (buf.pos + length < buf.data.length) {
            // copy into
            buf.data.set(data, buf.pos);
            buf.pos += length;
        } else {
            // insert a chunk
            const chunk = buf.next = new WriteBuf(data);
            chunk.pos += length;
            chunk.next = new WriteBuf(buf.data.subarray(buf.pos));
        }
    }
}
