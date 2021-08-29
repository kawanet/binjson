#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const myJSON = binJSON.extend({handler: handlers.RegExp});

    it("RegExp", () => {
        const re = /re/;

        // compatible behavior per default
        assert.deepEqual(JSON.parse(JSON.stringify(re)), {});
        assert.deepEqual(binJSON.decode(binJSON.encode(re)), {});
    });

    test("$", /reg/);
    test("$", /regex/i);

    function test(tag: string, value: RegExp): void {
        it(`${value}`, () => {
            const buf = myJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = myJSON.decode<RegExp>(buf);
            assert.equal(typeof rev, typeof value);
            assert.equal(rev instanceof RegExp, true);
            assert.equal(rev.source, value.source);
            assert.equal(rev.flags, value.flags);
        });
    }
});
