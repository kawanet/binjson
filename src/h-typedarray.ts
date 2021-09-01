/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {TagX} from "./enum";
import {Binary} from "./h-binary";

type FromFn = (buffer: ArrayBuffer, byteOffset: number, length: number) => ArrayBufferView;
type MatchFn = (value: any) => boolean;
type HandlerX = binjson.HandlerX<ArrayBufferView, Binary>;

function initHandlers() {
    const handlers: HandlerX[] = [];

    const addType = (size: number, tagX: number, from: FromFn, match: MatchFn): void => {
        const handler = {tagX, match} as HandlerX;

        handler.decode = (binary) => {
            let data: Uint8Array = binary.subarray();

            // copy memory for Uint16Array etc.
            // RangeError: start offset of XX should be a multiple of XX
            if (data.byteOffset % size) {
                data = data.slice()
            }

            const {buffer, byteOffset, byteLength} = data;
            return from(buffer, byteOffset, byteLength / size);
        };

        handler.encode = Binary.from;

        handlers.push(handler);
    };

    addType(1, TagX.Int8Array, (b, o, l) => new Int8Array(b, o, l), v => (v instanceof Int8Array));
    addType(1, TagX.Uint8Array, (b, o, l) => new Uint8Array(b, o, l), v => (v instanceof Uint8Array));
    addType(1, TagX.Uint8ClampedArray, (b, o, l) => new Uint8ClampedArray(b, o, l), v => (v instanceof Uint8ClampedArray));
    addType(2, TagX.Int16Array, (b, o, l) => new Int16Array(b, o, l), v => (v instanceof Int16Array));
    addType(2, TagX.Uint16Array, (b, o, l) => new Uint16Array(b, o, l), v => (v instanceof Uint16Array));
    addType(4, TagX.Int32Array, (b, o, l) => new Int32Array(b, o, l), v => (v instanceof Int32Array));
    addType(4, TagX.Uint32Array, (b, o, l) => new Uint32Array(b, o, l), v => (v instanceof Uint32Array));
    addType(4, TagX.Float32Array, (b, o, l) => new Float32Array(b, o, l), v => (v instanceof Float32Array));
    addType(8, TagX.Float64Array, (b, o, l) => new Float64Array(b, o, l), v => (v instanceof Float64Array));
    addType(8, TagX.BigInt64Array, (b, o, l) => new BigInt64Array(b, o, l), ("undefined" !== typeof BigInt64Array) && (v => (v instanceof BigInt64Array)));
    addType(8, TagX.BigUint64Array, (b, o, l) => new BigUint64Array(b, o, l), ("undefined" !== typeof BigUint64Array) && (v => (v instanceof BigUint64Array)));
    addType(1, TagX.DataView, (b, o, l) => new DataView(b, o, l), v => (v instanceof DataView));

    return handlers;
}

export const hArrayBufferView = initHandlers();

export const hArrayBuffer: binjson.HandlerX<ArrayBuffer, Binary> = {
    tagX: TagX.ArrayBuffer,

    decode: (binary) => {
        const {buffer, byteOffset, byteLength} = binary.subarray();
        return buffer.slice(byteOffset, byteOffset + byteLength);
    },

    match: (value) => (value instanceof ArrayBuffer),

    encode: ((value) => Binary.from(new Uint8Array(value))),
};