#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    it("kString0", () => {
        const data = new Uint8Array([0x63, 0x31, 0x32, 0x33]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, "123");
    });

    it("kString16", () => {
        const data = new Uint8Array([0x53, 0x00, 0x03, 0x41, 0x42, 0x43]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, "ABC");
    });

    it("kString32", () => {
        const data = new Uint8Array([0x13, 0x00, 0x00, 0x00, 0x03, 0x61, 0x62, 0x63]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, "abc");
    });

    test("");

    // U+0031
    test("1");
    test("12");
    test("123");

    // U+03B1
    test("α");
    test("αβ");
    test("αβγ");

    // U+FF11
    test("１");
    test("１２");
    test("１２３");

    // U+1F600
    test("😀");
    test("😀😀");
    test("😀😀😀");

    function test(value: any): void {
        it(JSON.stringify(value), () => {
            const buf = binJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");

            const rev = binJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
