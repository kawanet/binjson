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

    const handler22 = makeHandler(0x22);
    const handler5B = makeHandler(0x5B);
    const handler7B = makeHandler(0x7B);

    it("multiple handlers", () => {
        {
            assert.equal(new MyClass(100).toString(), "val=100 tag=0x")
        }
        {
            const myJSON = binJSON.extend({handler: handler22});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(101)));
            assert.equal(decoded.toString(), "val=101 tag=0x22");
        }
        {
            const myJSON = binJSON.extend({handler: [handler5B, handler7B]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(102)));
            assert.equal(decoded.toString(), "val=102 tag=0x5B");
        }
        {
            const myJSON = binJSON.extend({handler: [handler7B, handler5B]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(103)));
            assert.equal(decoded.toString(), "val=103 tag=0x7B");
        }
        {
            const myJSON = binJSON.extend({handler: [handler22, handler5B, handler7B]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(104)));
            assert.equal(decoded.toString(), "val=104 tag=0x22");
        }
    });
});
