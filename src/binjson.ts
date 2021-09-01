/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {decode} from "./decode";
import {encode} from "./encode";
import {defaults} from "./enum";
import {WriteBuf} from "./write-buf";
import {ReadBuf} from "./read-buf";
import {ReadDriver} from "./read-driver";
import {WriteDriver} from "./write-driver";
import {defaultWriter} from "./write-router";
import {defaultReader} from "./read-router";

const ceil1K = (num: number) => (((num + 1023) >> 10) << 10);

export class BinJSON implements binjson.IBinJSON<Uint8Array> {
    protected reader: ReadDriver;
    protected writer: WriteDriver;
    protected bufSize = defaults.initialBufferSize;

    constructor(base?: BinJSON) {
        this.reader = new ReadDriver(base && base.reader || defaultReader);
        this.writer = new WriteDriver(base && base.writer || defaultWriter);
    }

    extend(options: binjson.Options): binjson.IBinJSON<Uint8Array> {
        const child = new BinJSON(this);
        child.reader.add(options.handler);
        child.writer.add(options.handler);
        return child;
    }

    decode<V = any>(data: Uint8Array): V {
        const buf = new ReadBuf(data);
        return decode(this.reader, buf);
    }

    encode(value: any): Uint8Array {
        const buf = new WriteBuf(this.bufSize);
        const data = encode(this.writer, value, buf);
        if (data) this.bufSize = ceil1K(data.length);
        return data;
    }
}

export const binJSON: binjson.IBinJSON<Uint8Array> = new BinJSON();
