/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {SubTag} from "./enum";
import {toBinary} from "./h-binary";

/**
 * Node.js Buffer
 */

export const hBuffer: binjson.HandlerX<Buffer> = {
    subtag: SubTag.Buffer,

    read: (_subtag, next) => Buffer.from(next()),

    match: value => Buffer.isBuffer(value),

    write: (value, next) => next(toBinary(value)),
};
