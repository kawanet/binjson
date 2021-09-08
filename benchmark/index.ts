#!/usr/bin/env node

/**
 * @example
 * node benchmark
 * node benchmark binJSON JSONB msgpack
 * node benchmark "short OneByteString"
 */

import {strict as assert} from "assert";
import {binjson, binJSON as _binJSON, handlers} from "../";
import * as JSONB from "json-buffer";
import * as msglite from "msgpack-lite";
import * as msgpack from "@msgpack/msgpack";
import * as EJSON from "ejson";
import {Event, Suite} from "benchmark";

interface DataSet {
    EJSON: string;
    JSON: string;
    JSONB: string;
    binJSON: Uint8Array;
    msglite: Uint8Array;
    msgpack: Uint8Array;
}

const SLEEP = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));
const SIZE = (data: any) => Buffer.from(JSON.stringify(data)).length;

const handler: binjson.Handler<any>[] = [];
const {StringPureJS, StringBuffer, StringNative} = process.env;
if (StringPureJS) handler.push(handlers.StringPureJS);
if (StringBuffer) handler.push(handlers.StringBuffer);
if (StringNative) handler.push(handlers.StringNative);
const binJSON = _binJSON.extend({handler});

async function CLI(argv: string[]) {
    const suite = new Suite();
    const re = argv.length && argv.map(v => new RegExp(v));
    prepare((title, name, fn) => {
        title += " " + name;
        if (!re || re.some(re => re.test(title))) suite.add(title, fn);
    });
    suite.on("cycle", (event: Event) => console.log(String(event.target)));
    // suite.on("complete", () => console.log('Fastest is ' + suite.filter('fastest').map('name')));
    await SLEEP(1);
    suite.run({async: true});
}

function prepare(add: (title: string, name: string, fn: Function) => void) {

    {
        const array: number[] = [];
        for (let i = 0; i < 256; i++) array.push(i);
        for (let j = 256; j < Number.MAX_SAFE_INTEGER; j *= 2) array.push(j);
        stringifyTest(`number ${SIZE(array)}`, array);
    }

    {
        const array: string[] = [];
        for (let length = 1; length < 32; length++) {
            for (let i = 0; i < 10; i++) {
                array.push(String.fromCharCode(i + 48).repeat(length));
            }
        }
        stringifyTest(`short OneByteString ${SIZE(array)}`, array);
    }

    {
        const array: string[] = [];
        for (let repeat = 1; repeat < 32; repeat++) {
            for (let i = 0; i < 10; i++) {
                // U+FF10 - U+FF19
                array.push(String.fromCharCode(i + 0xFF10).repeat(repeat));
            }
        }
        stringifyTest(`short TwoByteString ${SIZE(array)}`, array);
    }

    {
        const array: string[] = [];
        for (let i = 0; i < 10; i++) { // 256 to 128K
            array.push(String.fromCharCode(i + 48).repeat((2 ** i) * 256));
        }
        stringifyTest(`long OneByteString ${SIZE(array)}`, array);
    }

    {
        const array: string[] = [];
        for (let i = 0; i < 10; i++) {
            array.push(String.fromCharCode(i + 0xFF10).repeat((2 ** i) * 256));
        }
        stringifyTest(`long TwoByteString ${SIZE(array)}`, array);
    }

    {
        const nest = (a: any[]) => [a, a];
        let array: any[] = [];
        for (let i = 0; i < 10; i++) array = nest(array);
        stringifyTest(`nest Array ${SIZE(array)}`, array);
    }

    {
        const nest = (a: object) => ({1: a, 2: a});
        let object = {};
        for (let i = 0; i < 10; i++) object = nest(object);
        stringifyTest(`nest Object (${SIZE(object)})`, object);
    }

    binaryTest("Buffer 1KB", 1000);
    binaryTest("Buffer 10KB", 10000);
    binaryTest("Buffer 100KB", 100000);
    binaryTest("Buffer 1MB", 1000000);

    function stringifyTest(title: string, source: any) {

        const data = {} as DataSet;

        data.binJSON = binJSON.encode(source);
        data.EJSON = EJSON.stringify(source);
        data.JSON = JSON.stringify(source);
        data.JSONB = JSONB.stringify(source);
        data.msglite = msglite.encode(source);
        data.msgpack = msgpack.encode(source);

        assert.deepEqual(binJSON.decode(data.binJSON), source);
        assert.deepEqual(EJSON.parse(data.EJSON), source);
        assert.deepEqual(JSON.parse(data.JSON), source);
        assert.deepEqual(JSONB.parse(data.JSONB), source);
        assert.deepEqual(msglite.decode(data.msglite), source);
        assert.deepEqual(msgpack.decode(data.msgpack), source);

        add(title, "binJSON.encode()", () => binJSON.encode(source));
        add(title, "binJSON.decode()", () => binJSON.decode(data.binJSON));

        add(title, "EJSON.stringify()", () => EJSON.stringify(source));
        add(title, "EJSON.parse()", () => EJSON.parse(data.JSON));
        add(title, "JSON.stringify()", () => JSON.stringify(source));
        add(title, "JSON.parse()", () => JSON.parse(data.JSON));
        add(title, "JSONB.stringify()", () => JSONB.stringify(source));
        add(title, "JSONB.parse()", () => JSONB.parse(data.JSONB));
        add(title, "msglite.encode()", () => msglite.encode(source));
        add(title, "msglite.decode()", () => msglite.decode(data.msglite));
        add(title, "msgpack.encode()", () => msgpack.encode(source));
        add(title, "msgpack.decode()", () => msgpack.decode(data.msgpack));
    }

    function binaryTest(title: string, size: number) {

        const data = {} as DataSet;
        const source = {buffer: Buffer.alloc(size), inline: {type: "Buffer", data: "base64:AAAA"}};

        check(binJSON.decode(data.binJSON = binJSON.encode(source)));
        check(EJSON.parse(data.EJSON = EJSON.stringify(source)));
        check(JSONB.parse(data.JSONB = JSONB.stringify(source)));
        check(msglite.decode(data.msglite = msglite.encode(source)));
        check(msgpack.decode(data.msgpack = msgpack.encode(source)) as any);

        function check(decoded: typeof source) {
            assert.equal(decoded.buffer.length, size);
            assert.equal(decoded.buffer instanceof Uint8Array, true);
            assert.deepEqual(decoded.inline, source.inline);
        }

        add(title, "binJSON.encode()", () => binJSON.encode(source));
        add(title, "binJSON.decode()", () => binJSON.decode(data.binJSON));
        add(title, "EJSON.stringify()", () => EJSON.stringify(source));
        add(title, "EJSON.parse()", () => EJSON.parse(data.JSONB));
        add(title, "JSONB.stringify()", () => JSONB.stringify(source));
        add(title, "JSONB.parse()", () => JSONB.parse(data.JSONB));
        add(title, "msglite.encode()", () => msglite.encode(source));
        add(title, "msglite.decode()", () => msglite.decode(data.msglite));
        add(title, "msgpack.encode()", () => msgpack.encode(source));
        add(title, "msgpack.decode()", () => msgpack.decode(data.msgpack));
    }
}

Promise.resolve(process.argv.slice(2)).then(CLI).catch(console.error);
