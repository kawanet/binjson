#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    test("(", []);
    test("(", [null]);
    test("(", [true]);
    test("(", [true, false]);
    test("(", [0]);
    test("(", [0, 123]);
    test("(", [""]);
    test("(", ["ABC", "DEF"]);

    // nest
    test("(", [[], 1]);
    test("(", [[[], 2], 1]);
    test("(", [[[[], 3], 2], 1]);

    it("[undefined]", () => {
        assert.deepEqual(binJSON.decode(binJSON.encode([undefined])), [null]);
    });

    function test(tag: string, value: any): void {
        it(JSON.stringify(value), () => {
            const buf = binJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = binJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
