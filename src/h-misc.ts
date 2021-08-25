/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

type Handler<T> = binjson.Handler<T>;

/**
 * Date
 */

export const hDate: Handler<Date> = {
    tag: Tag.kDate,

    read: (buf) => new Date(buf.readF64()),

    match: (value) => (value instanceof Date),

    write: (buf, value) => {
        buf.tag(Tag.kDate);
        buf.writeF64(+value);
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

    read: (buf, next) => {
        const count = buf.count();
        if (count !== 2) throw new SyntaxError(`Invalid packet count: ${count}`);
        const source = next();
        const flags = next();
        return new RegExp(source, flags);
    },

    match: (value) => (value instanceof RegExp),

    write: (buf, value, next) => {
        const {flags, source} = value;
        buf.tag(Tag.kRegExp);
        buf.count(2);
        next(source || "");
        next(flags || "");
    },
}
