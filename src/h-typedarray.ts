/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {Tag, ArrayBufferViewTag as ST} from "./enum";

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

addType(ST.kInt8Array, Int8Array);
addType(ST.kUint8Array, Uint8Array);
addType(ST.kUint8ClampedArray, Uint8ClampedArray);
addType(ST.kInt16Array, Int16Array);
addType(ST.kUint16Array, Uint16Array);
addType(ST.kInt32Array, Int32Array);
addType(ST.kUint32Array, Uint32Array);
addType(ST.kFloat32Array, Float32Array);
addType(ST.kFloat64Array, Float64Array);
if ("undefined" !== typeof BigInt64Array) addType(ST.kBigInt64Array, BigInt64Array);
if ("undefined" !== typeof BigUint64Array) addType(ST.kBigUint64Array, BigUint64Array);
addType(ST.kDataView, DataView);

const defaultType = tagIndex[ST.kUint8Array];

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

    read: (buf) => {
        return buf.readData32((array, offset, length) => {
            const subtag = array[offset++];
            length--;
            const type = tagIndex[subtag] || defaultType;
            const {from, byte} = type;
            let {buffer, byteOffset} = array;
            const start = byteOffset + offset;

            // copy memory for Uint16Array etc.
            // RangeError: start offset of XX should be a multiple of XX
            if (byte > 1) {
                return from(buffer.slice(start, start + length));
            }

            // share memory for Uint8Array etc.
            return from(buffer, start, length / byte);
        });
    },

    match: value => ArrayBuffer.isView(value),

    write: (buf, value) => {
        buf.tag(Tag.kArrayBufferView);
        const {buffer, byteLength, byteOffset} = value;
        const subtag = pickSubTag(value);
        const data = new Uint8Array(buffer, byteOffset, byteLength);
        buf.insertData(data, subtag);
    }
};
