#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binjson, binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const utf8JSON = binJSON.create({handler: handlers.UTF8});
    const utf16JSON = binJSON.create({handler: handlers.UTF16});

    const onebyte = "123456789.".repeat(10); // 100 bytes
    const twobyte = "１２３４５６７８９．".repeat(5); // 100 bytes

    // auto
    test(null, onebyte, 1, 100);
    test(null, onebyte, 1, 1000);
    test(null, onebyte, 1, 10000);
    test(null, onebyte, 1, 100000);
    test(null, onebyte, 1, 1000000);

    test(null, twobyte, 1, 100);
    test(null, twobyte, 1, 1000);
    test(null, twobyte, 1, 10000);
    test(null, twobyte, 1, 100000);
    test(null, twobyte, 1, 1000000);

    // UTF16 kWideString

    test("W", twobyte, 2, 100, utf16JSON);
    test("W", twobyte, 2, 1000, utf16JSON);
    test("W", twobyte, 2, 10000, utf16JSON);
    test("W", twobyte, 2, 100000, utf16JSON);
    test("W", twobyte, 2, 1000000, utf16JSON);

    // UTF8 kString

    test("S", twobyte, 3, 100, utf8JSON);
    test("S", twobyte, 3, 1000, utf8JSON);
    test("S", twobyte, 3, 10000, utf8JSON);
    test("S", twobyte, 3, 100000, utf8JSON);
    test("S", twobyte, 3, 1000000, utf8JSON);

    function test(tag: string, src: string, byte: number, repeat: number, myJSON?: binjson.IBinJSON<any>): void {
        if (!myJSON) myJSON = binJSON; // default behavior
        let value = "";
        while (value.length < repeat) value += src;
        const size = value.length * byte;

        it(`${byte} x ${repeat} bytes`, () => {
            const buf = myJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf.length > size, true, "byteLength");
            if (tag) assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = myJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.equal(rev, value);
        });
    }
});
