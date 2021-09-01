/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {SubTag} from "./enum";
import {Binary} from "./h-binary";

/**
 * Node.js Buffer
 */

export const hBuffer: binjson.HandlerX<Buffer, Binary> = {
    subtag: SubTag.Buffer,

    decode: (binary) => Buffer.from(binary.subarray()),

    match: value => Buffer.isBuffer(value),

    encode: Binary.from,
};
