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
