#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binjson, binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    class MyClass {
        val: number;

        constructor(val: number, private tag?: number) {
            this.val = val;
        }

        toString() {
            return `val=${this.val || "-"} tag=0x${this.tag?.toString(16).toUpperCase() || ""}`;
        }
    }

    function makeHandler(tag: number): binjson.Handler1<MyClass> {
        return {
            tag: tag,
            read: (buf) => new MyClass(buf.readI32(), tag),
            match: (value) => (value instanceof MyClass),
            write: (buf, value) => {
                buf.tag(tag);
                buf.writeI32(value.val);
            },
        };
    }

    const handler1B = makeHandler(0x1B);
    const handler1C = makeHandler(0x1C);
    const handler1D = makeHandler(0x1D);

    it("multiple handlers", () => {
        {
            assert.equal(new MyClass(100).toString(), "val=100 tag=0x")
        }
        {
            const myJSON = binJSON.extend({handler: handler1B});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(101)));
            assert.equal(decoded.toString(), "val=101 tag=0x1B");
        }
        {
            const myJSON = binJSON.extend({handler: [handler1C, handler1D]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(102)));
            assert.equal(decoded.toString(), "val=102 tag=0x1C");
        }
        {
            const myJSON = binJSON.extend({handler: [handler1D, handler1C]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(103)));
            assert.equal(decoded.toString(), "val=103 tag=0x1D");
        }
        {
            const myJSON = binJSON.extend({handler: [handler1B, handler1C, handler1D]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(104)));
            assert.equal(decoded.toString(), "val=104 tag=0x1B");
        }
    });
});
