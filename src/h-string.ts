/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag} from "./enum";

type WriteString = (buffer: Uint8Array, offset: number, string: string) => number;
type ReadString = (buffer: Uint8Array, offset: number, length: number) => string;

type Handler = binjson.Handler1<string>;
type ReadFn = binjson.Handler1<string>["read"];
type WriteFn = binjson.Handler1<string>["write"];
type MatchFn = binjson.Handler1<string>["match"];

const enum E {
    str0start = +Tag.kString0,
    str0end = 0x100,
    str0max = (str0end - str0start),
    str16max = 0x10000,
}

const tag = [Tag.kString16, Tag.kString32];
for (let i: number = E.str0start; i < E.str0end; i++) tag.push(i);

const match: MatchFn = (value) => ("string" === typeof value);

/**
 * @private
 * @param readShort - decoder function for shorter string
 * @param writeShort - encoder function for shorter string
 * @param readLong - decoder function for longer string
 * @param writeLong - encoder function for longer string
 */

const build = (readShort: ReadString, writeShort: WriteString, readLong?: ReadString, writeLong?: WriteString): Handler => {
    if (!writeLong) writeLong = writeShort;
    if (!readLong) readLong = readShort;

    const read: ReadFn = ((buf, tag) => {
        if (tag === Tag.kString16) {
            return buf.readData16(readLong);
        } else if (tag === Tag.kString32) {
            return buf.readData32(readLong);
        } else if (tag >= Tag.kString0) {
            const length = tag - Tag.kString0;
            const {pos} = buf;
            buf.pos += 1 + length;
            return readShort(buf.data, pos + 1, length);
        }
    });

    const write: WriteFn = (buf, value) => {
        const clength = value.length; // character length
        let length = clength * 3; // byte length
        buf = buf.prepare(5 + length);

        if ((length < E.str0max) || (clength < E.str0max && !/[^\x00-\x7f]/.test(value))) {
            length = writeShort(buf.data, buf.pos + 1, value);
            buf.tag(Tag.kString0 + length);
            buf.pos += 1 + length;
        } else if (length < E.str16max) {
            buf.tag(Tag.kString16);
            buf.writeData16(length, (data, offset) => writeLong(data, offset, value));
        } else {
            buf.tag(Tag.kString32);
            buf.writeData32(length, (data, offset) => writeLong(data, offset, value));
        }
    };

    return {tag, read, match, write};
}

/**
 * handlers.StringPureJS: Pure JavaScript implementation
 */

const readPureJS: ReadString = (buffer, offset, length) => {
    if (length === 0) {
        return "";
    } else if (length === 1) {
        const c = buffer[offset];
        if (c < 128) return String.fromCharCode(c);
    }

    let index = offset | 0;
    const end = offset + length;
    let string = "";

    while (index < end) {
        const chunk: number[] = [];
        const cend = Math.min(index + 256, end);

        while (index < cend) {
            const chr = buffer[index++];

            if (chr < 128) { // 1 byte
                chunk.push(chr);
            } else if ((chr & 0xE0) === 0xC0) { // 2 bytes
                chunk.push((chr & 0x1F) << 6 |
                    (buffer[index++] & 0x3F));

            } else if ((chr & 0xF0) === 0xE0) { // 3 bytes
                chunk.push((chr & 0x0F) << 12 |
                    (buffer[index++] & 0x3F) << 6 |
                    (buffer[index++] & 0x3F));

            } else if ((chr & 0xF8) === 0xF0) { // 4 bytes
                let code = (chr & 0x07) << 18 |
                    (buffer[index++] & 0x3F) << 12 |
                    (buffer[index++] & 0x3F) << 6 |
                    (buffer[index++] & 0x3F);

                if (code < 0x010000) {
                    chunk.push(code);
                } else { // surrogate pair
                    code -= 0x010000;
                    chunk.push((code >>> 10) + 0xD800, (code & 0x3FF) + 0xDC00);
                }
            }
        }

        string += String.fromCharCode.apply(String, chunk);
    }

    return string;
}

const writePureJS: WriteString = (buffer, start, string) => {
    let index = start;
    const length = string.length;
    let chr = 0;
    let idx = 0;
    while (idx < length) {
        chr = string.charCodeAt(idx++);

        if (chr < 128) {
            buffer[index++] = chr;
        } else if (chr < 0x800) {
            // 2 bytes
            buffer[index++] = 0xC0 | (chr >>> 6);
            buffer[index++] = 0x80 | (chr & 0x3F);
        } else if (chr < 0xD800 || chr > 0xDFFF) {
            // 3 bytes
            buffer[index++] = 0xE0 | (chr >>> 12);
            buffer[index++] = 0x80 | ((chr >>> 6) & 0x3F);
            buffer[index++] = 0x80 | (chr & 0x3F);
        } else {
            // 4 bytes - surrogate pair
            chr = (((chr - 0xD800) << 10) | (string.charCodeAt(idx++) - 0xDC00)) + 0x10000;
            buffer[index++] = 0xF0 | (chr >>> 18);
            buffer[index++] = 0x80 | ((chr >>> 12) & 0x3F);
            buffer[index++] = 0x80 | ((chr >>> 6) & 0x3F);
            buffer[index++] = 0x80 | (chr & 0x3F);
        }
    }
    return index - start;
}

let encoder: TextEncoder;
let decoder: TextDecoder;

/**
 * handlers.StringNative: TextEncoder/TextDecoder wrapper
 */

const readDecoder: ReadString = (data, offset, length) => {
    if (!decoder) decoder = new TextDecoder();
    return decoder.decode(data.subarray(offset, offset + length));
}

const writeEncoder: WriteString = (data, offset, string) => {
    if (!encoder) encoder = new TextEncoder();
    const {written} = encoder.encodeInto(string, data.subarray(offset, offset + string?.length * 3));
    return written;
}

/**
 * handlers.StringBuffer: Buffer wrapper
 */

const readBuffer: ReadString = (data, offset, length) => {
    const {buffer, byteOffset} = data;
    return Buffer.from(buffer, byteOffset + offset, length).toString();
}

const writeBuffer: WriteString = (data, offset, string) => {
    const {buffer, byteOffset, byteLength} = data;
    return Buffer.from(buffer, byteOffset, byteLength).write(string, offset);
}

/**
 * the default string handler switches encoder/decoders depend on string length.
 * for shorter string, pure JS implementation is faster than native encoders which have object creation overhead.
 * for longer string, native encoders are faster than pure JS implementation.
 */

const buildAuto = (): Handler => {
    /**
     * on Node.js, it prefers to use Buffer as encoding with Buffer is faster than TextEncoder.
     */
    const hasBuffer = ("undefined" !== typeof Buffer && Buffer.from && !!Buffer.prototype?.write);
    if (hasBuffer) {
        return build(readPureJS, writePureJS, readBuffer, writeBuffer);
    }

    /**
     * on most browsers, it prefers to use TextEncoder/TextDeocder which is faster than pure JS implementation.
     */
    const hasTextEncoder = ("undefined" !== typeof TextEncoder && !!TextEncoder.prototype?.encodeInto);
    if (hasTextEncoder) {
        return build(readPureJS, writePureJS, readDecoder, writeEncoder);
    }

    /**
     * on old browsers which does not support TextEncoder#encodeInto methods, it fallbacks to pure JS impl only.
     */
    return build(readPureJS, writePureJS);
}

/**
 * UTF8
 */

export const hStringPureJS = build(readPureJS, writePureJS);
export const hStringBuffer = build(readBuffer, writeBuffer);
export const hStringNative = build(readDecoder, writeEncoder);
export const hString = buildAuto();
