#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

const DESCRIBE = ("undefined" !== typeof Buffer) ? describe : describe.skip;

const toHex = (obj: Buffer | number[]) => [].map.call(obj, (v: number) => (0x100 | v).toString(16).substring(1)).join("-").toUpperCase();

DESCRIBE(TITLE, () => {
    const myJSON = binJSON.create({handler: handlers.Buffer});

    it("kNodeBuffer", () => {
        const data = new Uint8Array([0x08, 0x2c, 0xce, 0xb0, 0x34, 2, 0, 0, 0, 3, 0x41, 0x42, 0x43]);
        const decoded = myJSON.decode(data);
        assert.equal(Buffer.isBuffer(decoded), true);
        assert.deepEqual(toHex(decoded), toHex([0x41, 0x42, 0x43]));
    });

    it("Buffer", () => {
        const source = Buffer.from([65, 66, 67, 68]);
        const encoded = myJSON.encode(source);
        assert.equal(Buffer.isBuffer(encoded), false);

        const decoded = myJSON.decode(encoded);
        assert.equal(Buffer.isBuffer(decoded), true);
        assert.equal(decoded instanceof Uint8Array, true);
        assert.equal(`${decoded}`, `${source}`);
    });

    it("Uint8Array", () => {
        const source = new Uint8Array([65, 66, 67, 68]);
        const encoded = myJSON.encode(source);
        assert.equal(Buffer.isBuffer(encoded), false);

        const decoded = myJSON.decode(encoded);
        assert.equal(Buffer.isBuffer(decoded), false);
        assert.equal(decoded instanceof Uint8Array, true);
        assert.equal(`${decoded}`, `${source}`);
    });
});
