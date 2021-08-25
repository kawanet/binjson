#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {

    it("toJSON method", () => {
        class MyClass {
            constructor(private val: number) {
                //
            }

            toJSON() {
                return `[${this.val}]`;
            }
        }

        const foo = new MyClass(123);

        test(foo, "[123]");
        test({foo: foo}, {foo: "[123]"});
        test([foo], ["[123]"]);
    });

    it("toJSON function", () => {
        const foo = {
            toJSON: function (key: string) {
                assert.equal(this, foo);
                return `<${key}>`;
            }
        };

        test(foo, "<>");
        test({foo: foo}, {foo: "<foo>"});
        test([foo], ["<0>"]);
    });

    it("returns undefined", () => {
        const foo = {
            toJSON: (): undefined => undefined,
        };

        assert.equal(JSON.stringify(foo), undefined);
        assert.equal(binJSON.encode(foo), undefined);

        test([foo], [null]);
        test([foo, foo], [null, null]);
        test([1, foo, 3], [1, null, 3]);

        test({foo: foo}, {});
        test({foo: foo, bar: "BAR"}, {bar: "BAR"});
    });

    function test(data: any, expect?: any) {
        const ref = JSON.parse(JSON.stringify(data));
        if (expect) assert.deepEqual(ref, expect);
        const actual = binJSON.decode(binJSON.encode(data));
        assert.deepEqual(actual, ref);
    }
});