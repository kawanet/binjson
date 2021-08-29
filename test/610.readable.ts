#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

const toU8A = (str: string) => Uint8Array.from(str.split("").map(c => c.charCodeAt(0)));
const toHex = (obj: Uint8Array) => [].map.call(obj, (v: number) => (0x100 | v).toString(16).substring(1)).join("-").toUpperCase();

describe(TITLE, () => {
    {
        const text = "(TF?0)";
        const expected = [true, false, null, 0];
        it(text, () => {
            const data = toU8A(text);
            const decoded = binJSON.decode(data);
            assert.deepEqual(decoded, expected);
            const encoded = binJSON.encode(expected);
            assert.equal(toHex(encoded), toHex(data));
        });
    }
    {
        const text = "<cVALcKEY>";
        const expected = {KEY: "VAL"};
        it(text, () => {
            const data = toU8A(text);
            const decoded = binJSON.decode(data);
            assert.deepEqual(decoded, expected);
            const encoded = binJSON.encode(expected);
            assert.equal(toHex(encoded), toHex(data));
        });
    }
    {
        const text = "<(<(123)cBAR(456)cBUZ>)cFOO>";
        const expected = {FOO: [{BAR: [1, 2, 3], BUZ: [4, 5, 6]}]};
        it(text, () => {
            const data = toU8A(text);
            const decoded = binJSON.decode(data);
            assert.deepEqual(decoded, expected);
            const encoded = binJSON.encode(expected);
            assert.equal(toHex(encoded), toHex(data));
        });
    }
});
