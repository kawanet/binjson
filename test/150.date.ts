#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const myJSON = binJSON.create({handler: handlers.Date});

    it("kDate", () => {
        const raw = new Date(0);
        const data = new Uint8Array([0x44, 0xFA, 0xAA, 0xBC, 0x6E, 0x30]);
        const decoded = binJSON.decode(data);
        assert.equal(decoded instanceof Date, true);
        assert.deepEqual(decoded, raw);

        // compatible behavior per default
        const date = "2021-08-20T00:00:00.000Z";
        assert.equal(JSON.parse(JSON.stringify(new Date(date))), date);
        assert.equal(binJSON.decode(binJSON.encode(new Date(date))), date);
    });

    test("D", new Date("2021-08-20T00:00:00.000Z"));
    test("D", new Date("1969-12-31T23:59:59.999Z")); // -1
    test("D", new Date("1970-01-01T00:00:00.000Z")); // 0
    test("D", new Date("1970-01-01T00:00:00.001Z")); // +1

    function test(tag: string, value: any): void {
        it(JSON.stringify(value), () => {
            const buf = myJSON.encode(value);
            assert.equal(ArrayBuffer.isView(buf), true, "ArrayBuffer.isView");
            assert.equal(buf[0]?.toString(16), tag.charCodeAt(0).toString(16), "tag");

            const rev = myJSON.decode(buf);
            assert.equal(typeof rev, typeof value);
            assert.deepEqual(rev, value);
            assert.equal(rev instanceof Date, true);
        });
    }
});
