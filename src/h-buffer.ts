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

    read: (_subtag, next) => Buffer.from(next().subarray()),

    match: value => Buffer.isBuffer(value),

    write: (value, next) => next(Binary.from(value)),
};
