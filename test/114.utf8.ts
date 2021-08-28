#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const myJSON = binJSON.create({handler: handlers.UTF8});

    it("kString16", () => {
        const data = new Uint8Array([0x53, 0x00, 0x00, 0x00, 0x03, 0x41, 0x42, 0x43]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, "ABC");
    });

    // empty
    test("S", 2, "");

    // U+0031
    test("S", 3, "1");
    test("S", 4, "12");
    test("S", 5, "123");

    // U+03B1
    test("S", 4, "α");
    test("S", 6, "αβ");
    test("S", 8, "αβγ");

    // U+FF11
    test("S", 5, "１");
    test("S", 8, "１２");
    test("S", 11, "１２３");

    // U+1F600
    test("S", 6, "😀");
    test("S", 10, "😀😀");
    test("S", 14, "😀😀😀");

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
