#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    it("empty", () => {
        assert.throws(() => JSON.parse(""), /Unexpected/i);
        assert.throws(() => binJSON.decode(Uint8Array.from([])), /Unexpected/i);
    });

    it("unexpected end", () => {
        assert.throws(() => JSON.parse("[1"), /Unexpected/i);
        assert.throws(() => binJSON.decode(Uint8Array.from([0x28, 0x31])), /Unexpected/i);
    });

    it("reserved tag", () => {
        assert.doesNotThrow(() => binJSON.decode(Uint8Array.from([0x31]))); // ok
        assert.throws(() => binJSON.decode(Uint8Array.from([0x1F])), /0x1F/i); // reserved
    });
});
