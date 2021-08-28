/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

type Handler<T> = binjson.Handler<T>;

/**
 * undefined
 */

export const hUndefined: Handler<undefined> = {
    tag: Tag.kUndefined,

    read: (buf) => {
        buf.pos++;
        return undefined;
    },

    match: (value) => (value === undefined),

    write: (buf) => {
        buf = buf.prepare(1);
        buf.tag(Tag.kUndefined);
        buf.pos++;
    },
};

/**
 * true
 */

export const hTrue: Handler<boolean> = {
    tag: Tag.kTrue,

    read: (buf) => {
        buf.pos++;
        return true;
    },

    match: (value) => (value === true),

    write: (buf) => {
        buf.tag(Tag.kTrue);
        buf.pos++;
    },
};

/**
 * false
 */

export const hFalse: Handler<boolean> = {
    tag: Tag.kFalse,

    read: (buf) => {
        buf.pos++;
        return false;
    },

    match: (value) => (value === false),

    write: (buf) => {
        buf.tag(Tag.kFalse);
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
