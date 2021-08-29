/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {SubTag} from "./enum";
import {toBinary} from "./h-binary";

type FromFn = (buffer: ArrayBuffer, byteOffset: number, length: number) => ArrayBufferView;
type MatchFn = (value: any) => boolean;

function initHandlers() {
    const handlers: binjson.HandlerX<ArrayBufferView>[] = [];

    const addType = (size: number, subtag: number, from: FromFn, match: MatchFn): void => {
        const handler = {} as binjson.HandlerX<ArrayBufferView>;

        handler.subtag = subtag;

        handler.read = (_, next) => {
            let data: Uint8Array = next();

            // copy memory for Uint16Array etc.
            // RangeError: start offset of XX should be a multiple of XX
            if (data.byteOffset % size) {
                data = data.slice()
            }

            const {buffer, byteOffset, byteLength} = data;
            return from(buffer, byteOffset, byteLength / size);
        };

        handler.match = match;

        handler.write = (value, next) => next(toBinary(value));

        handlers.push(handler);
    };

    addType(1, SubTag.Int8Array, (b, o, l) => new Int8Array(b, o, l), v => (v instanceof Int8Array));
    addType(1, SubTag.Uint8Array, (b, o, l) => new Uint8Array(b, o, l), v => (v instanceof Uint8Array));
    addType(1, SubTag.Uint8ClampedArray, (b, o, l) => new Uint8ClampedArray(b, o, l), v => (v instanceof Uint8ClampedArray));
    addType(2, SubTag.Int16Array, (b, o, l) => new Int16Array(b, o, l), v => (v instanceof Int16Array));
    addType(2, SubTag.Uint16Array, (b, o, l) => new Uint16Array(b, o, l), v => (v instanceof Uint16Array));
    addType(4, SubTag.Int32Array, (b, o, l) => new Int32Array(b, o, l), v => (v instanceof Int32Array));
    addType(4, SubTag.Uint32Array, (b, o, l) => new Uint32Array(b, o, l), v => (v instanceof Uint32Array));
    addType(4, SubTag.Float32Array, (b, o, l) => new Float32Array(b, o, l), v => (v instanceof Float32Array));
    addType(8, SubTag.Float64Array, (b, o, l) => new Float64Array(b, o, l), v => (v instanceof Float64Array));
    addType(8, SubTag.BigInt64Array, (b, o, l) => new BigInt64Array(b, o, l), v => (v instanceof BigInt64Array));
    addType(8, SubTag.BigUint64Array, (b, o, l) => new BigUint64Array(b, o, l), v => (v instanceof BigUint64Array));
    addType(1, SubTag.DataView, (b, o, l) => new DataView(b, o, l), v => (v instanceof DataView));

    return handlers;
}

export const hArrayBufferView = initHandlers();
