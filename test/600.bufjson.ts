#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {bufJSON} from "../";

const TITLE = __filename.split("/").pop();

const DESCRIBE = ("undefined" !== typeof Buffer) ? describe : describe.skip;

DESCRIBE(TITLE, () => {

    it("bufJSON", () => {
        const source = {foo: 1, bar: 1.5, buz: [true, false, null]};

        const encoded = bufJSON.encode(source);
        assert.equal(Buffer.isBuffer(encoded), true);

        const decoded = bufJSON.decode(encoded);
        assert.equal(Buffer.isBuffer(decoded), false);

        assert.deepEqual(decoded, source);
    });
});
