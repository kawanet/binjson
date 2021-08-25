#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    test("Z", BigInt("0"));
    test("Z", BigInt("1"));
    test("Z", BigInt("-1"));
    test("Z", BigInt("123456"));
    test("Z", BigInt("1234567"));
    test("Z", BigInt("12345678"));
    test("Z", BigInt("123456789"));
    test("Z", BigInt("1234567890123456"));

    function test(tag: string, value: any): void {
        it(value + "n", () => {
            const buf = binJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = binJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
