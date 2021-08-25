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

    test("0", 1, null);
    test("T", 1, true);
    test("F", 1, false);
    test("I", 6, 0);
    test("I", 6, 1);
    test("I", 6, -1);
    test("N", 10, 0.5);
    test("N", 10, -0.5);

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
