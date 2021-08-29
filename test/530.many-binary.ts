#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const ten = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];

    test(1);
    test(10);
    test(100);
    test(1000);
    test(10000);

    function test(count: number): void {
        let array: number[] = [];
        for (let i = 0; i < count; i++) array = array.concat(ten);
        const source = Uint8Array.from(array);
        const {length} = source;

        it(`${length} bytes`, () => {
            const encoded = binJSON.encode(source);
            assert.equal(encoded.length > length, true, "byteLength");

            const decoded = binJSON.decode(encoded);
            assert.equal(decoded instanceof Uint8Array, true);
            assert.deepEqual(decoded.length, source.length);
            assert.deepEqual(decoded[0], source[0]);
        });
    }
});
