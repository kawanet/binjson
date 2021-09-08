#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const myJSON = binJSON.extend({handler: handlers.StringPureJS});

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

    // empty
    test(1, "");

    // U+0031
    test(2, "1");
    test(3, "12");
    test(4, "123");

    // U+03B1
    test(3, "α");
    test(5, "αβ");
    test(7, "αβγ");

    // U+FF11
    test(4, "１");
    test(7, "１２");
    test(10, "１２３");

    // U+1F600
    test(5, "😀");
    test(9, "😀😀");
    test(13, "😀😀😀");

    function test(size: number, value: any): void {
        const tagHex = (size + 95).toString(16);

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
