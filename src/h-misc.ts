/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {SubTag, Tag} from "./enum";

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
 * Date
 */

export const hDate: Handler<Date> = {
    tag: Tag.kDate,
    subtag: SubTag.Date,

    read: (buf, _, next) => {
        const subtag = buf.readI32() >>> 0;
        if (subtag !== SubTag.Date) return;

        return new Date(next());
    },

    match: (value) => (value instanceof Date),

    write: (buf, value, next) => {
        buf.tag(Tag.kDate);
        buf.writeI32(SubTag.Date);
        next(+value);
    },
};

/**
 * null
 */

export const hNull: Handler<null> = {
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

export const hRegExp: Handler<RegExp> = {
    tag: Tag.kRegExp,
    subtag: SubTag.RegExp,

    read: (buf, _, next) => {
        const subtag = buf.readI32() >>> 0;
        if (subtag !== SubTag.RegExp) return;

        const source = next();
        const flags = next();
        return new RegExp(source, flags);
    },

    match: (value) => (value instanceof RegExp),

    write: (buf, value, next) => {
        buf.tag(Tag.kRegExp);
        buf.writeI32(SubTag.RegExp);

        const {flags, source} = value;
        next(source || "");
        next(flags || "");
    },
}
