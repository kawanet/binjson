/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {binJSON} from "./binjson";
import {handlers} from "./handler";

function create(options?: binjson.Options): binjson.IBinJSON<Buffer> {
    const _binJSON = binJSON.create(options);

    /**
     * bufJSON.decode() method is an alias of binJSON.decode()
     */
    const {decode} = _binJSON;

    /**
     * bufJSON.encode() method is just a wrapper to convert binJSON.encode() result.
     */
    const encode = (value: any): Buffer => {
        const buf = _binJSON.encode(value); // => Uint8Array
        return Buffer.from(buf, buf.byteOffset, buf.byteLength); // => Buffer
    };

    return {create, decode, encode};
}

/**
 * Node.js Buffer version of binJSON
 */

export const bufJSON = create({handler: handlers.Buffer});
