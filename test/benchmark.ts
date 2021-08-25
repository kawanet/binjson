#!/usr/bin/env node

/**
 * @example
 * REPEAT=100000 EJSON=1 MSGLITE=1 ./node_modules/.bin/mocha test/benchmark.js
 *
 * @note
 * - buffer-json fails round-trip on `{type: "Buffer", data: "base64:AAAA"}` plain object.
 * - https://www.npmjs.com/package/buffer-json
 */

import {strict as assert} from "assert";
import {binJSON} from "../";
import * as JSONB from "json-buffer";
import * as msglite from "msgpack-lite";
import * as msgpack from "@msgpack/msgpack";
import * as EJSON from "ejson";

const TITLE = __filename.split("/").pop();

const REPEAT = +process.env.REPEAT || 10;
const SLEEP = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

const {ONLY} = process.env;
const IT = it;

const IT_EJSON = (process.env.EJSON || +REPEAT <= 100) ? it : it.skip;
const IT_JSONB = (process.env.JSONB || +REPEAT <= 100) ? it : it.skip;
const IT_MSGLITE = (process.env.MSGLITE || +REPEAT <= 100) ? it : it.skip;

interface DataSet {
    EJSON: string;
    JSON: string;
    JSONB: string;
    binJSON: Uint8Array;
    msglite: Uint8Array;
    msgpack: Uint8Array;
}

describe(`REPEAT=${REPEAT} mocha ${TITLE}`, () => {
    const it = !ONLY ? IT : (title: string, fn?: any) => {
        ((/^\(/.test(title[0]) || (title.indexOf(ONLY) > -1)) ? IT : IT.skip)(title, fn);
    };

    stringTest(+REPEAT, "package.json", require("../package.json"));
    binaryTest(+REPEAT * 10, 100);
    binaryTest(+REPEAT, 10000);
    binaryTest(+REPEAT / 10, 1000000);

    function stringTest(repeat: number, title: string, source: any) {

        describe(`${title} x ${repeat} times`, () => {
            const data = {} as DataSet;

            it("(preparation)", async () => {
                await SLEEP(1);

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

                await SLEEP(1);
            });

            it("binJSON.encode()", test(repeat, () => binJSON.encode(source)));
            it("binJSON.decode()", test(repeat, () => binJSON.decode(data.binJSON)));

            IT_EJSON("EJSON.stringify()", test(repeat, () => EJSON.stringify(source)));
            IT_EJSON("EJSON.parse()", test(repeat, () => EJSON.parse(data.JSON)));
            it("JSON.stringify()", test(repeat, () => JSON.stringify(source)));
            it("JSON.parse()", test(repeat, () => JSON.parse(data.JSON)));
            IT_JSONB("JSONB.stringify()", test(repeat, () => JSONB.stringify(source)));
            IT_JSONB("JSONB.parse()", test(repeat, () => JSONB.parse(data.JSONB)));
            IT_MSGLITE("msglite.encode()", test(repeat, () => msglite.encode(source)));
            IT_MSGLITE("msglite.decode()", test(repeat, () => msglite.decode(data.msglite)));
            it("msgpack.encode()", test(repeat, () => msgpack.encode(source)));
            it("msgpack.decode()", test(repeat, () => msgpack.decode(data.msgpack) as any));
        });
    }

    function binaryTest(repeat: number, size: number) {

        describe(`Binary ${size} byte x ${repeat} times`, () => {
            const data = {} as DataSet;
            const source = {buffer: Buffer.alloc(size), inline: {type: "Buffer", data: "base64:AAAA"}};

            it("(preparation)", async () => {
                await SLEEP(1);

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

                await SLEEP(1);
            });

            it("binJSON.encode()", test(repeat, () => binJSON.encode(source)));
            it("binJSON.decode()", test(repeat, () => binJSON.decode(data.binJSON)));
            IT_EJSON("EJSON.stringify()", test(repeat, () => EJSON.stringify(source)));
            IT_EJSON("EJSON.parse()", test(repeat, () => EJSON.parse(data.JSONB)));
            IT_JSONB("JSONB.stringify()", test(repeat, () => JSONB.stringify(source)));
            IT_JSONB("JSONB.parse()", test(repeat, () => JSONB.parse(data.JSONB)));
            IT_MSGLITE("msglite.encode()", test(repeat, () => msglite.encode(source)));
            IT_MSGLITE("msglite.decode()", test(repeat, () => msglite.decode(data.msglite)));
            it("msgpack.encode()", test(repeat, () => msgpack.encode(source)));
            it("msgpack.decode()", test(repeat, () => msgpack.decode(data.msgpack) as any));
        });
    }

    function test<T extends { length: number }>(repeat: number, fn: () => T) {
        return async function (this: any) {
            this.timeout(10000);
            let first: T;
            let last: T;

            for (let i = 0; i < repeat; i++) {
                last = fn();
                if (!first) first = last;
            }

            assert.equal(typeof last, typeof first);
        }
    }
});
