#!/usr/bin/env node

/**
 * @example
 * REPEAT=100000 ./node_modules/.bin/mocha test/performance.js
 * ONLY=encode REPEAT=100000 ./node_modules/.bin/mocha test/performance.js
 */

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

const REPEAT = +process.env.REPEAT || 10;
const SLEEP = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

const {ONLY} = process.env;
const _it = it;

describe(`REPEAT=${REPEAT} mocha ${TITLE}`, () => {
    const it = !ONLY ? _it : (title: string, fn?: any) => {
        ((/^\(/.test(title[0]) || (title.indexOf(ONLY) > -1)) ? _it : _it.skip)(title, fn);
    };

    it("(preparation)", async () => SLEEP(1));

    {
        const item = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, idx) => idx.toString(36).repeat(num));
        const source = repeat([item, item, item, item, item], 100); // 500 items
        const encoded = binJSON.encode(source);

        it(`encode short OneByteString (${encoded.length})`, test(() => binJSON.encode(source), encoded));
        it(`decode short OneByteString (${encoded.length})`, test(() => binJSON.decode(encoded), source));
    }

    {
        const item = [100, 1000, 10000, 100000].map((num, idx) => idx.toString(36).repeat(num));
        const source = repeat([item], 1);
        const encoded = binJSON.encode(source);

        it(`encode long OneByteString (${encoded.length})`, test(() => binJSON.encode(source), encoded));
        it(`decode long OneByteString (${encoded.length})`, test(() => binJSON.decode(encoded), source));
    }

    {
        const item = [1, 2, 3, 4, 5, 6, 7].map((num, idx) => String.fromCharCode(65296 + idx).repeat(num));
        const source = repeat([item, item, item, item, item], 100); // 500 items
        const encoded = binJSON.encode(source);

        it(`encode short TwoByteString (${encoded.length})`, test(() => binJSON.encode(source), encoded));
        it(`decode short TwoByteString (${encoded.length})`, test(() => binJSON.decode(encoded), source));
    }

    {
        const item = [10, 100, 1000, 10000].map((num, idx) => String.fromCharCode(65296 + idx).repeat(num));
        const source = repeat([item], 10);
        const encoded = binJSON.encode(source);

        it(`encode long TwoByteString (${encoded.length})`, test(() => binJSON.encode(source), encoded));
        it(`decode long TwoByteString (${encoded.length})`, test(() => binJSON.decode(encoded), source));
    }

    {
        const item = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => Math.pow(2, v));
        const source = repeat([item, item, item, item, item], 200); // 1000 items
        const encoded = binJSON.encode(source);

        it(`encode Int32 (${encoded.length})`, test(() => binJSON.encode(source), encoded));
        it(`decode Int32 (${encoded.length})`, test(() => binJSON.decode(encoded), source));
    }

    {
        const item = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => v + 0.5);
        const source = repeat([item, item, item, item, item], 200); // 1000 items
        const encoded = binJSON.encode(source);

        it(`encode Float64 (${encoded.length})`, test(() => binJSON.encode(source), encoded));
        it(`decode Float64 (${encoded.length})`, test(() => binJSON.decode(encoded), source));
    }
});

function repeat<T>(array: T[], count: number): T[] {
    let out: T[] = [];
    for (let i = 0; i < count; i++) out = out.concat(array);
    return out;

}

function test<T>(fn: () => T, result: T) {
    return async function (this: any) {
        this.timeout(10000);
        let last: T;

        for (let i = 0; i < REPEAT; i++) {
            last = fn();
        }

        assert.equal(typeof last, typeof result);
    }
}
