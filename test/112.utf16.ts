#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const myJSON = binJSON.extend({handler: handlers.UTF16});

    it("kWideString16", () => {
        const data = new Uint8Array([0x57, 0x00, 0x06, 0x00, 0x41, 0x00, 0x42, 0x00, 0x43]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, "ABC");
    });

    it("kWideString32", () => {
        const data = new Uint8Array([0x17, 0x00, 0x00, 0x00, 0x06, 0x00, 0x61, 0x00, 0x62, 0x00, 0x63]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, "abc");
    });

    // empty
    test("W", "");

    // U+0031
    test("W", "1");
    test("W", "12");
    test("W", "123");

    // U+03B1
    test("W", "α");
    test("W", "αβ");
    test("W", "αβγ");

    // U+FF11
    test("W", "１");
    test("W", "１２");
    test("W", "１２３");

    // U+1F600
    test("W", "😀");
    test("W", "😀😀");
    test("W", "😀😀😀");

    function test(tag: string, value: any): void {
        const size = 3 + value.length * 2;
        const tagHex = tag.charCodeAt(0).toString(16);

        it(JSON.stringify(value), () => {
            const buf = myJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            if (tagHex) assert.equal(buf[0]?.toString(16), tagHex, "tag");
            if (size) assert.equal(buf.length, size, "byteLength");

            const rev = myJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
