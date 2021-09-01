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

const init = (options: binjson.Options, reader: ReadDriver, writer: WriteDriver): binjson.BinJSON<Uint8Array> => {
    reader = new ReadDriver(reader);
    writer = new WriteDriver(writer);
    reader.add(options.handler);
    writer.add(options.handler);

    let bufSize = defaults.initialBufferSize;

    // binJSON is just a plain object but not an instance of BinJSON class
    return {
        // encode a value to Uint8Array
        encode: (value) => {
            const buf = new WriteBuf(bufSize);
            const data = encode(writer, value, buf);
            if (data) bufSize = ceil1K(data.length);
            return data;
        },

        // decode a value from Uint8Array
        decode: (data) => decode(reader, new ReadBuf(data)),

        // inheritance
        extend: (options) => init(options, reader, writer),
    };
};

export const binJSON: binjson.BinJSON<Uint8Array> = init({}, defaultReader, defaultWriter);
