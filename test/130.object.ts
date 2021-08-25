#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    test("<", {});
    test("<", {null: null});
    test("<", {bool: false});
    test("<", {number: 123});
    test("<", {string: "ABC"});
    test("<", {"": ""});
    test("<", {bool: true, number: 123, string: "ABC"});

    // nest
    test("<", {child: {}, level: 1});
    test("<", {child: {child: {}, level: 2}, level: 1});
    test("<", {child: {child: {child: {}, level: 3}, level: 2}, level: 1});

    it(`{"undef": undefined,"null": null}`, () => {
        assert.deepEqual(binJSON.decode(binJSON.encode({"undef": undefined, "null": null})), {null: null});
    });

    function test(tag: string, value: any): void {
        it(JSON.stringify(value), () => {
            const buf = binJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = binJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
        });
    }
});
