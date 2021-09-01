/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {binJSON} from "./binjson";
import {handlers} from "./read-router";

const init = (bufJSON: binjson.BinJSON<Uint8Array>): binjson.BinJSON<Buffer> => {

    // bufJSON is just a plain object but not an instance of BufJSON class
    const {encode, decode, extend} = bufJSON;

    return {
        // encode a value to Buffer
        encode: (value) => {
            const buf = encode(value); // => Uint8Array
            return Buffer.from(buf, buf.byteOffset, buf.byteLength); // => Buffer
        },

        // just a redirect to binJSON with handlers.Buffer
        decode,

        // inheritance
        extend: (options) => init(extend(options)),
    };
};

/**
 * Node.js Buffer version of binJSON
 */

export const bufJSON: binjson.BinJSON<Buffer> = init(binJSON.extend({handler: handlers.Buffer}));
