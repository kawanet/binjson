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

    read: (_subtag, next) => new Date(next()),

    match: (value) => (value instanceof Date),

    write: (value, next) => next(+value),
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

export const hRegExp: binjson.HandlerX<RegExp, string> = {
    subtag: SubTag.RegExp,

    read: (_subtag, next) => {
        const source = next();
        const flags = next();
        return new RegExp(source, flags);
    },

    match: (value) => (value instanceof RegExp),

    write: (value, next) => {
        const {flags, source} = value;
        next(source || "");
        next(flags || "");
    },
}
