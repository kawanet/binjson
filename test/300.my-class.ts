#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binjson, binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    class MyClass {
        val: number;

        constructor(val: number) {
            this.val = val;
        }

        toString() {
            return `[${this.val}]`;
        }
    }

    const MyTag = 0x1F;

    const myHandler: binjson.Handler1<MyClass> = {
        tag: MyTag,

        read: (buf) => new MyClass(buf.readI32()),

        match: (value) => (value instanceof MyClass),

        write: (buf, value) => {
            buf.tag(MyTag);
            buf.writeI32(value.val);
        },
    };

    it("handler", () => {
        const myJSON = binJSON.extend({handler: myHandler});
        const data = {foo: new MyClass(123), bar: new MyClass(456)};

        assert.equal(data.foo.toString(), "[123]");
        assert.equal(data.bar.toString(), "[456]");

        const encoded = myJSON.encode(data);
        const decoded = myJSON.decode<typeof data>(encoded);

        assert.equal(decoded.foo.toString(), "[123]");
        assert.equal(decoded.bar.toString(), "[456]");

        assert.equal(decoded.foo instanceof MyClass, true);
        assert.equal(decoded.bar instanceof MyClass, true);
    });

    it("handlers", () => {
        const myJSON = binJSON.extend({handler: [myHandler, handlers.Date]});
        const date = new Date("2021-08-21T00:00:00.000Z");
        const data = {foo: new MyClass(789), date: date};

        const encoded = myJSON.encode(data);
        const decoded = myJSON.decode<typeof data>(encoded);

        assert.equal(decoded.foo.toString(), "[789]");
        assert.deepEqual(decoded.date, date);

        assert.equal(decoded.foo instanceof MyClass, true);
        assert.equal(decoded.date instanceof Date, true);
    });
});