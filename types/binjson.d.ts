/**
 * @see https://github.com/kawanet/binjson
 */

export const {bufJSON, binJSON, handlers} = binjson;

export declare module binjson {
    const bufJSON: IBinJSON<Buffer>;

    const binJSON: IBinJSON<Uint8Array>;

    const handlers: Handlers;

    interface IBinJSON<D> {
        create: (options: Options) => IBinJSON<D>;
        decode: <V = any>(data: D) => V;
        encode: (value: any) => D;
    }

    interface Options {
        handler?: Handler<any>;
        handlers?: Handler<any>[];
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
     * interfaces below are needed extension developers but not for library users.
     */

    type Handler<T> = ReadHandler<T> & WriteHandler<T>;

    interface ReadHandler<T> {
        tag?: number;

        read: (buf: ReadBuf, next: () => any) => T;
    }

    interface WriteHandler<T> {
        match?: (value: any) => boolean;

        write: (buf: WriteBuf, value: T, next: (value: any, key?: number | string, parent?: any) => boolean) => void;

        allowToJSON?: boolean;
    }

    interface ReadBuf {
        pos: number;

        tag(): number;

        count(): number;

        readI32(): number;

        readF64(): number;

        readData<T>(fn: (data: Uint8Array, offset: number, length: number) => T): T;

        readView<T>(fn: (view: DataView, offset: number, length: number) => T): T;
    }

    interface WriteBuf {
        pos: number;

        prepare(size: number): WriteBuf;

        tag(tag: number): void;

        count(count: number): void;

        writeI32(value: number): void;

        writeF64(value: number): void;

        writeData(size: number, fn: (data: Uint8Array, offset: number) => number): void;

        writeView(size: number, fn: (view: DataView, offset: number) => number): void;

        insertData(data: Uint8Array, subtag?: number): void;
    }
}
