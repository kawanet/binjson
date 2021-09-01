/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {SubTag, Tag} from "./enum";

/**
 * undefined
 */

export const hUndefined: binjson.Handler1<undefined> = {
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
 * Date
 */

export const hDate: binjson.HandlerX<Date, number> = {
    subtag: SubTag.Date,

    decode: (value) => new Date(value),

    match: (value) => (value instanceof Date),

    encode: (date) => +date,
};

/**
 * null
 */

export const hNull: binjson.Handler1<null> = {
    tag: Tag.kNull,

    read: (buf) => {
        buf.pos++;
        return null;
    },

    match: (value) => (value === null),

    write: (buf) => {
        buf.tag(Tag.kNull);
        buf.pos++;
    },
}

/**
 * RegExp
 */

export const hRegExp: binjson.HandlerX<RegExp, string[]> = {
    subtag: SubTag.RegExp,

    decode: (array) => {
        const [source, flags] = array;
        return new RegExp(source, flags);
    },

    match: (value) => (value instanceof RegExp),

    encode: (value) => {
        const {flags, source} = value;
        return [(source || ""), (flags || "")];
    },
}
