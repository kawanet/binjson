#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const myJSON = binJSON.create({handler: handlers.UTF16});

    it("kWideString16", () => {
        const data = new Uint8Array([0x57, 0x00, 0x00, 0x00, 0x06, 0x41, 0x00, 0x42, 0x00, 0x43, 0x00]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, "ABC");
    });

    // empty
    test("W", 2, "");

    // U+0031
    test("W", 4, "1");
    test("W", 6, "12");
    test("W", 8, "123");

    // U+03B1
    test("W", 4, "α");
    test("W", 6, "αβ");
    test("W", 8, "αβγ");

    // U+FF11
    test("W", 4, "１");
    test("W", 6, "１２");
    test("W", 8, "１２３");

    // U+1F600
    test("W", 6, "😀");
    test("W", 10, "😀😀");
    test("W", 14, "😀😀😀");

    function test(tag: string, size: number, value: any): void {
        it(JSON.stringify(value), () => {
            const buf = myJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");
            size = 0; // TODO
            if (size) assert.equal(buf.length, size, "byteLength");

            const rev = myJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
