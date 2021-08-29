#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binjson, binJSON} from "../";
import {murmur3} from "murmurhash-js";

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

    const myHandler: binjson.HandlerX<MyClass, number> = {
        subtag: murmur3(MyClass.name),

        read: (_subtag, next) => new MyClass(next()),

        match: (value) => (value instanceof MyClass),

        write: (value, next) => next(value.val),
    };

    it("handler", () => {
        assert.equal(myHandler.subtag?.toString(16), "50bdf49f");

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
});