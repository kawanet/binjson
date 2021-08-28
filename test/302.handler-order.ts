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
            return `val=${this.val || "-"} tag=${this.tag || "-"}`;
        }
    }

    function makeHandler(tag: number): binjson.Handler<MyClass> {
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

    const handler201 = makeHandler(201);
    const handler202 = makeHandler(202);
    const handler203 = makeHandler(203);

    it("multiple handlers", () => {
        {
            assert.equal(new MyClass(100).toString(), "val=100 tag=-")
        }
        {
            const myJSON = binJSON.create({handler: handler201});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(101)));
            assert.equal(decoded.toString(), "val=101 tag=201");
        }
        {
            const myJSON = binJSON.create({handler: [handler202, handler203]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(102)));
            assert.equal(decoded.toString(), "val=102 tag=202");
        }
        {
            const myJSON = binJSON.create({handler: [handler203, handler202]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(103)));
            assert.equal(decoded.toString(), "val=103 tag=203");
        }
        {
            const myJSON = binJSON.create({handler: [handler201, handler202, handler203]});
            const decoded = myJSON.decode(myJSON.encode(new MyClass(104)));
            assert.equal(decoded.toString(), "val=104 tag=201");
        }
    });
});
