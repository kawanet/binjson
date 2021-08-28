/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {decode} from "./decode";
import {encode} from "./encode";
import {defaults} from "./enum";
import {WriteBuf} from "./write-buf";
import {ReadBuf} from "./read-buf";
import {Driver} from "./driver";

const ceil1K = (num: number) => (((num + 1023) >> 10) << 10);

export class BinJSON implements binjson.IBinJSON<Uint8Array> {
    protected driver: Driver;
    protected bufSize = defaults.initialBufferSize;

    constructor(options: binjson.Options, base?: Driver) {
        if (!base) base = new Driver();
        this.driver = base.extend(options);
    }

    extend(options: binjson.Options): binjson.IBinJSON<Uint8Array> {
        return new BinJSON(options, this.driver);
    }

    decode<V = any>(data: Uint8Array): V {
        const buf = new ReadBuf(data);
        return decode(this.driver, buf);
    }

    encode(value: any): Uint8Array {
        const buf = new WriteBuf(this.bufSize);
        const data = encode(this.driver, value, buf);
        if (data) this.bufSize = ceil1K(data.length);
        return data;
    }
}

export const binJSON: binjson.IBinJSON<Uint8Array> = new BinJSON({});
