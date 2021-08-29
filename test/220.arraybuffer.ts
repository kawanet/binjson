#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

const toHex = (obj: Uint8Array | number[]) => [].map.call(obj, (v: number) => (0x100 | v).toString(16).substring(1)).join("-").toUpperCase();

describe(TITLE, () => {
    /**
     * ArrayBuffer = 0x3c63bb3b
     */
    it("SubTag.ArrayBuffer", () => {
        const data = new Uint8Array([0x24, 0x3c, 0x63, 0xbb, 0x3b, 0x42, 0x00, 0x04, 0x41, 0x42, 0x43, 0x44]);
        const decoded = binJSON.decode<ArrayBuffer>(data);
        assert.equal(decoded instanceof ArrayBuffer, true);
        assert.equal(decoded?.byteLength, 4);
        assert.deepEqual(toHex(new Uint8Array(decoded)), toHex([0x41, 0x42, 0x43, 0x44]));
    });

    it("ArrayBuffer", () => {
        const source = new ArrayBuffer(4);
        const data = new Uint8Array(source);
        data[0] = 0x61;
        data[1] = 0x62;
        data[2] = 0x63;
        data[3] = 0x64;
        const encoded = binJSON.encode(source);
        assert.equal(encoded[0], 0x24);

        const decoded = binJSON.decode<ArrayBuffer>(encoded);
        assert.equal(decoded instanceof ArrayBuffer, true);
        assert.equal(decoded?.byteLength, 4);
        assert.deepEqual(toHex(new Uint8Array(decoded)), toHex([0x61, 0x62, 0x63, 0x64]));
    });
});
