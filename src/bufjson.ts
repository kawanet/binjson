/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {BinJSON} from "./binjson";
import {handlers} from "./read-route";

class BufJSON extends BinJSON implements binjson.IBinJSON<Buffer> {
    extend(options: binjson.Options): binjson.IBinJSON<Buffer> {
        return new BufJSON(options, this.driver);
    }

    /**
     * bufJSON.encode() method is just a wrapper to convert binJSON.encode() result.
     */

    encode(value: any): Buffer {
        const buf = super.encode(value); // => Uint8Array
        return Buffer.from(buf, buf.byteOffset, buf.byteLength); // => Buffer
    }
}

/**
 * Node.js Buffer version of binJSON
 */

export const bufJSON: binjson.IBinJSON<Buffer> = new BufJSON({handler: handlers.Buffer});
