#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {bufJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

const DESCRIBE = ("undefined" !== typeof Buffer) ? describe : describe.skip;
const toHex = (obj: Buffer) => [].map.call(obj, (v: number) => (0x100 | v).toString(16).substring(1)).join("-").toUpperCase();

DESCRIBE(TITLE, () => {

    it("bufJSON", () => {
        const source = {foo: 1, bar: 1.5, buz: [true, false, null]};

        const encoded = bufJSON.encode(source);
        assert.equal(Buffer.isBuffer(encoded), true);

        const decoded = bufJSON.decode<typeof source>(encoded);
        assert.equal(Buffer.isBuffer(decoded), false);

        assert.deepEqual(decoded, source);
    });

    it("bufJSON.encode()", () => {
        const source = {data: Buffer.from([0x41, 0x42, 0x43])};

        const encoded = bufJSON.encode(source);
        assert.equal(Buffer.isBuffer(encoded), true);

        const decoded = bufJSON.decode<typeof source>(encoded);
        assert.equal(Buffer.isBuffer(decoded), false);
        assert.equal(Buffer.isBuffer(decoded.data), true);

        assert.equal(toHex(decoded.data), toHex(source.data));
    });

    it("bufJSON.extend()", () => {
        const source = {date: new Date("2021-09-02")};

        {
            const encoded = bufJSON.encode(source);
            assert.equal(Buffer.isBuffer(encoded), true);

            const decoded = bufJSON.decode<typeof source>(encoded);
            assert.equal(typeof decoded.date, "string");
            assert.equal(decoded.date, source.date.toISOString());
        }
        {
            const myJSON = bufJSON.extend({handler: handlers.Date});
            const encoded = myJSON.encode(source);
            assert.equal(Buffer.isBuffer(encoded), true);

            const decoded = myJSON.decode<typeof source>(encoded);
            assert.equal(typeof decoded.date, "object");
            assert.equal(decoded.date instanceof Date, true);
            assert.equal(decoded.date.toISOString(), source.date.toISOString());
        }
    });
});
