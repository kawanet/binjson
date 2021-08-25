#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    let str = "123456789."; // 10 bytes
    str = str + str + str + str + str + str + str + str + str + str; // 100 bytes

    test("<", str, 1);
    test("<", str, 10);
    test("<", str, 100);
    test("<", str, 1000);
    test("<", str, 10000);

    function test(tag: string, str: string, count: number): void {
        const value: { [key: string]: string } = {};
        for (let i = 0; i < count; i++) value[i] = str;
        const atleast = str.length * count;

        it(`${atleast} bytes`, () => {
            const buf = binJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf.length > atleast, true, "byteLength");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = binJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
