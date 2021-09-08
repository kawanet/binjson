#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    it("kTrue", () => {
        const data = new Uint8Array([0x54, 0x00]);
        const decoded = binJSON.decode(data);
        assert.deepEqual(decoded, true);
    });

    // kNull
    test("N", 1, null);

    // kTrue
    test("T", 1, true);

    // kFalse
    test("F", 1, false);

    // kNumber0
    test("0", 1, 0);
    test("1", 1, 1);
    test("2", 1, 2);
    test("3", 1, 3);
    test("4", 1, 4);
    test("5", 1, 5);
    test("6", 1, 6);
    test("7", 1, 7);
    test("8", 1, 8);
    test("9", 1, 9);

    // kInt32
    test("I", 5, 10);
    test("I", 5, -1);

    // kDouble
    test("D", 9, 0.5);
    test("D", 9, -0.5);

    function test(tag: string, size: number, value: any): void {
        it(`[${tag}] ` + JSON.stringify(value), () => {
            const buf = binJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf.length, size, "byteLength");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = binJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
