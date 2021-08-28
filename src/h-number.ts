/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

type Handler<T> = binjson.Handler<T>;

const hNumber0tag: number[] = new Array(10);
for (let i = 0; i < 10; i++) hNumber0tag[i] = Tag.kNumber0 + i;

/**
 * 0 to 9
 */

export const hNumber0: Handler<number> = {
    tag: hNumber0tag,

    read: (buf, tag) => {
        buf.pos++;
        return tag & 15;
    },

    write: (buf, value) => {
        buf.tag(Tag.kNumber0 + (value | 0));
        buf.pos++;
    },
};

/**
 * signed integer
 */

export const hInt32: Handler<number> = {
    tag: Tag.kInt32,

    read: (buf) => buf.readI32(),

    write: (buf, value) => {
        buf.tag(Tag.kInt32);
        buf.writeI32(value);
    },
};

/**
 * float number
 */

export const hDouble: Handler<number> = {
    tag: Tag.kDouble,

    read: (buf) => buf.readF64(),

    write: (buf, value) => {
        buf.tag(Tag.kDouble);
        buf.writeF64(value);
    },
};

/**
 * big integer
 */

export const hBigInt: Handler<bigint> = {
    tag: Tag.kBigInt,

    read: (buf, _, next) => {
        buf.pos += 2;
        return BigInt(next());
    },

    write: (buf, value, next) => {
        const string = value.toString();
        const {length} = string;
        buf = buf.prepare(8 + length);
        buf.tag(Tag.kBigInt);
        buf.count(1);
        next(string);
    },
};
