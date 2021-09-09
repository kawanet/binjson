#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binjson, binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    tests("(default)", true, binJSON);

    tests("StringPureJS", true, binJSON.extend({handler: handlers.StringPureJS}));

    const hasTextEncoder = ("undefined" !== typeof TextEncoder && !!TextEncoder.prototype?.encodeInto);
    tests("StringNative", hasTextEncoder, binJSON.extend({handler: handlers.StringNative}));

    const hasBuffer = ("undefined" !== typeof Buffer && Buffer.from && !!Buffer.prototype?.write);
    tests("StringBuffer", hasBuffer, binJSON.extend({handler: handlers.StringBuffer}));

    it("[string, number]", () => {
        for (let i = 0; i < 256; i++) {
            const source = [String.fromCharCode(i).repeat(i), i];
            const decoded = binJSON.decode<typeof source>(binJSON.encode(source));
            assert.deepEqual(decoded, source, `#${i}`);
        }
    });
});

function tests(title: string, enabled: boolean, codec: binjson.BinJSON<Uint8Array>) {
    const IT = enabled ? it : it.skip;

    const onebyte = "123456789."; // 10 bytes
    const twobyte = "αβγδεζηθικ"; // 20 bytes in UTF8
    const threebyte = "１２３４５６７８９．"; // 30 bytes in UTF8

    test(String.fromCharCode(0x60), onebyte, 0);
    test(String.fromCharCode(0x60 + 100), onebyte, 100);
    test("S", onebyte, 10000);
    test("^S", onebyte, 1000000);

    test("S", twobyte, 100);
    test("S", twobyte, 10000);
    test("^S", twobyte, 1000000);

    test("S", threebyte, 100);
    test("S", threebyte, 10000);
    test("^S", threebyte, 1000000);

    function test(tag: string, src: string, clength: number): void {
        const first = src.charCodeAt(0);
        const type = (first < 0x0080) ? 1 : (first < 0x0800) ? 2 : 3;
        const value = src.repeat(Math.ceil(clength / src.length)).substring(0, clength);
        const blength = value.length * type;

        const isCTRL = tag && (tag[0] === "^") ? 1 : 0;
        const tagHEX = tag && (tag.charCodeAt(isCTRL) - (isCTRL * 64)).toString(16);

        IT(`${title}: ${clength} x ${type} bytes`, () => {
            const buf = codec.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf.length > blength, true, "byteLength");
            if (tagHEX) assert.equal(buf[0]?.toString(16), tagHEX, "tag");

            const rev = codec.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.equal(rev, value);
        });
    }
}
