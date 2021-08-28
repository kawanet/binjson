/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag, SubTag} from "./enum";

type Handler<T> = binjson.Handler<T>;

/**
 * subset interface of TypedArray constructor
 */

interface C {
    new(buffer: ArrayBuffer, byteOffset?: number, length?: number): ArrayBufferView;

    BYTES_PER_ELEMENT?: number;
}

/**
 * Definition
 */

interface Type {
    tag: number;

    byte: number;

    // Buffer.from()
    from: (buffer: ArrayBuffer, byteOffset?: number, length?: number) => ArrayBufferView;

    // Buffer.isBuffer()
    match: (value: ArrayBufferView) => boolean;
}

const typeList: Type[] = [];
const tagIndex: Type[] = [];

const addType = (tag: number, fn: C): Type => {
    const def = {} as Type;
    def.tag = tag;
    def.byte = fn.BYTES_PER_ELEMENT || 1;
    def.from = ((buffer, byteOffset, length) => new fn(buffer, byteOffset, length));
    def.match = (value => value instanceof fn);
    typeList.push(def);
    tagIndex[tag] = def;
    return def;
};

addType(SubTag.Int8Array, Int8Array);
addType(SubTag.Uint8Array, Uint8Array);
addType(SubTag.Uint8ClampedArray, Uint8ClampedArray);
addType(SubTag.Int16Array, Int16Array);
addType(SubTag.Uint16Array, Uint16Array);
addType(SubTag.Int32Array, Int32Array);
addType(SubTag.Uint32Array, Uint32Array);
addType(SubTag.Float32Array, Float32Array);
addType(SubTag.Float64Array, Float64Array);
if ("undefined" !== typeof BigInt64Array) addType(SubTag.BigInt64Array, BigInt64Array);
if ("undefined" !== typeof BigUint64Array) addType(SubTag.BigUint64Array, BigUint64Array);
addType(SubTag.DataView, DataView);

const defaultType = tagIndex[SubTag.Uint8Array];

const pickSubTag = (obj: ArrayBufferView): number => {
    for (const type of typeList) {
        if (type.match(obj)) return type.tag;
    }
};

/**
 * TypedArray
 */

export const hArrayBufferView: Handler<ArrayBufferView> = {
    tag: Tag.kArrayBufferView,

    read: (buf, tag) => {
        const subtag = buf.readI32() >>> 0;
        const type = tagIndex[subtag] || defaultType;
        const {from, byte} = type;

        const cb = (array: Uint8Array, offset: number, length: number) => {
            let {buffer, byteOffset} = array;
            const start = byteOffset + offset;

            // copy memory for Uint16Array etc.
            // RangeError: start offset of XX should be a multiple of XX
            if (byte > 1) {
                return from(buffer.slice(start, start + length));
            }

            // share memory for Uint8Array etc.
            return from(buffer, start, length / byte);
        };

        tag = buf.tag();
        if (tag === Tag.kBinary16) {
            return buf.readData16(cb);
        } else if (tag === Tag.kBinary32) {
            return buf.readData32(cb);
        }
    },

    match: value => ArrayBuffer.isView(value),

    write: (buf, value) => {
        const subtag = pickSubTag(value);
        buf.tag(Tag.kArrayBufferView);
        buf.writeI32(subtag);

        const {buffer, byteLength, byteOffset} = value;
        const data = new Uint8Array(buffer, byteOffset, byteLength);

        if (byteLength < 0x10000) {
            buf.tag(Tag.kBinary16);
            buf.insertData16(data);
        } else {
            buf.tag(Tag.kBinary32);
            buf.insertData32(data);
        }
    }
};
