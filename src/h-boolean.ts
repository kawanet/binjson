/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

/**
 * true
 */

export const hTrue: binjson.Handler1<boolean> = {
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

export const hFalse: binjson.Handler1<boolean> = {
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
