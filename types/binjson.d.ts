/**
 * @see https://github.com/kawanet/binjson
 */

export const {bufJSON, binJSON, handlers} = binjson;

export declare module binjson {
    const bufJSON: IBinJSON<Buffer>;

    const binJSON: IBinJSON<Uint8Array>;

    const handlers: Handlers;

    interface IBinJSON<D> {
        extend: (options: Options) => IBinJSON<D>;
        decode: <V = any>(data: D) => V;
        encode: (value: any) => D;
    }

    interface Options {
        handler?: Handler<any> | Handler<any>[];
    }

    interface Handlers {
        Buffer: Handler<Buffer>;
        Date: Handler<Date>;
        RegExp: Handler<RegExp>;
        Undefined: Handler<undefined>;
        UTF8: Handler<string>;
        UTF16: Handler<string>;
    }

    /**
     * Handler1 and HandlerX are needed for extension developers but not for library users.
     */

    type Handler<T> = Handler1<T, any> | HandlerX<T, any>;

    interface Handler1<T, P = never> {
        tag: number | number[];

        read: (buf: ReadBuf, tag: number, next: () => P) => T;

        match?: (value: any) => boolean;

        write: (buf: WriteBuf, value: T, next: (value: P, key?: number | string, parent?: any) => boolean) => void;

        allowToJSON?: boolean;
    }

    interface HandlerX<T, P = never> {
        subtag: number;

        read: (subtag: number, next: () => P) => T;

        match: (value: any) => boolean;

        write: (value: T, next: (value: P) => void) => void;
    }

    /**
     * ReadBuf and WriteBuf are only used with Handler1
     */

    interface ReadBuf {
        pos: number;
        data: Uint8Array; // only used kString0

        tag(): number;

        readI32(): number;

        readF64(): number;

        readData16<T>(fn: (data: Uint8Array, offset: number, length: number) => T): T;

        readData32<T>(fn: (data: Uint8Array, offset: number, length: number) => T): T;

        readView16<T>(fn: (view: DataView, offset: number, length: number) => T): T;

        readView32<T>(fn: (view: DataView, offset: number, length: number) => T): T;
    }

    interface WriteBuf {
        pos: number;
        data: Uint8Array; // only used kString0

        prepare(size: number): WriteBuf;

        tag(tag: number): void;

        writeI32(value: number): void;

        writeF64(value: number): void;

        writeData16(size: number, fn: (data: Uint8Array, offset: number) => number): void;

        writeData32(size: number, fn: (data: Uint8Array, offset: number) => number): void;

        writeView16(size: number, fn: (view: DataView, offset: number) => number): void;

        writeView32(size: number, fn: (view: DataView, offset: number) => number): void;

        insertData16(data: Uint8Array): void;

        insertData32(data: Uint8Array): void;
    }
}
