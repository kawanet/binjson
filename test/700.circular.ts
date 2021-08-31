#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

interface FooBar {
    foo?: string | FooBar;
    bar?: string | FooBar;
    buz?: any[];
}

describe(TITLE, () => {

    it("Object", () => {
        const foo: FooBar = {foo: "FOO"};
        const bar: FooBar = {bar: "BAR"};
        bar.foo = foo;
        foo.bar = bar;

        assert.throws(() => JSON.stringify(foo), /circular/i);
        assert.throws(() => binJSON.encode(foo), /circular/i);
    });

    it("Array", () => {
        const foo: any[] = ["FOO"];
        const bar: any[] = ["BAR"];
        foo.push(bar);
        bar.push(foo);

        assert.throws(() => JSON.stringify(foo), /circular/i);
        assert.throws(() => binJSON.encode(foo), /circular/i);
    });

    it("mixture", () => {
        const foo: FooBar = {foo: "FOO"};
        const buz: any[] = ["BUZ"];
        foo.buz = buz;
        buz.push(foo);

        assert.throws(() => JSON.stringify(foo), /circular/i);
        assert.throws(() => binJSON.encode(foo), /circular/i);
    });
});