#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON, handlers} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    const myJSON = binJSON.create({handler: handlers.Undefined});

    it("undefined", () => {
        // root undefined value could not get encoded per default
        assert.deepEqual(JSON.stringify(undefined), undefined);
        assert.deepEqual(binJSON.encode(undefined), undefined);

        // it passes through with Undefined handler
        const encoded = myJSON.encode(undefined)
        assert.deepEqual(encoded?.length, 1);
        assert.deepEqual(encoded[0], 0x5f);
        assert.deepEqual(myJSON.decode(encoded), undefined);
    });

    it("[undefined]", () => {
        // array's undefined item is converted to null per default
        assert.deepEqual(JSON.stringify([undefined]), "[null]");
        assert.deepEqual(binJSON.decode(binJSON.encode([undefined])), [null]);

        // it passes through with Undefined handler
        assert.deepEqual(myJSON.decode(myJSON.encode([undefined])), [undefined]);
    });

    it("{foo: undefined}", () => {
        // object's undefined property is removed per default
        assert.deepEqual(JSON.stringify({foo: undefined}), "{}");
        assert.deepEqual(binJSON.decode(binJSON.encode({foo: undefined})), {});

        // it passes through with Undefined handler
        assert.deepEqual(myJSON.decode(myJSON.encode({foo: undefined})), {foo: undefined});
    });
});
