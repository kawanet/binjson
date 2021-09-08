#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binjson, binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const utf8JSON = binJSON.extend({handler: handlers.StringPureJS});

    // 100 single-byte characters = 100 bytes in UTF-8
    const onebyte = "123456789.".repeat(10); // 100 bytes

    // 50 multi-byte characters = 100 bytes in UTF-16 = 150 bytes in UTF-8
    const twobyte = "１２３４５６７８９．".repeat(5);

    // auto
    test((0x60 + 100), onebyte, 1, 100);
    test(null, onebyte, 1, 1000);
    test(null, onebyte, 1, 10000);
    test(null, onebyte, 1, 100000);
    test(null, onebyte, 1, 1000000);

    test(null, twobyte, 1, 100);
    test(null, twobyte, 1, 1000);
    test(null, twobyte, 1, 10000);
    test(null, twobyte, 1, 100000);
    test(null, twobyte, 1, 1000000);

    // UTF8 kString

    test("S", twobyte, 3, 100, utf8JSON);
    test("S", twobyte, 3, 1000, utf8JSON);
    test("S", twobyte, 3, 10000, utf8JSON);
    test("^S", twobyte, 3, 100000, utf8JSON);
    test("^S", twobyte, 3, 1000000, utf8JSON);

    it("[string, number]", () => {
        for (let i = 0; i < 256; i++) {
            const source = [String.fromCharCode(i).repeat(i), i];
            const decoded = binJSON.decode<typeof source>(binJSON.encode(source));
            assert.deepEqual(decoded, source, `#${i}`);
        }
    });

    function test(tag: string | number, src: string, byte: number, minsize: number, myJSON?: binjson.BinJSON<any>): void {
        if (!myJSON) myJSON = binJSON; // default behavior
        let value = "";
        while (value.length < minsize) value += src;
        const size = value.length * byte;
        if ("number" === typeof tag) tag = String.fromCharCode(tag);
        const isCTRL = tag && (tag[0] === "^") ? 1 : 0;
        const tagHEX = tag && (tag.charCodeAt(isCTRL) - (isCTRL * 64)).toString(16);

        it(`${byte} x ${size} bytes`, () => {
            const buf = myJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf.length > size, true, "byteLength");
            if (tagHEX) assert.equal(buf[0]?.toString(16), tagHEX, "tag");

            const rev = myJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.equal(rev, value);
        });
    }
});
