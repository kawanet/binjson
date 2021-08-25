#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    function fn() {
        //
    }

    it("fn", () => {
        assert.deepEqual(JSON.stringify(fn), undefined);
        assert.deepEqual(binJSON.encode(fn), undefined);
    });

    it("{fn: fn}", () => {
        assert.deepEqual(JSON.parse(JSON.stringify({fn: fn})), {});
        assert.deepEqual(binJSON.decode(binJSON.encode({fn: fn})), {});
    });

    it("[fn]", () => {
        assert.deepEqual(JSON.parse(JSON.stringify([fn])), [null]);
        assert.deepEqual(binJSON.decode(binJSON.encode([fn])), [null]);
    });
});