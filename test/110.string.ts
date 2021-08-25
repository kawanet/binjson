#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
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
