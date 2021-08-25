#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {binJSON} from "../";

const TITLE = __filename.split("/").pop();

const _assert = assert;
const _JSON = JSON;

describe(TITLE, () => {

    // alias
    const assert = {
        throws: (_: any, fn: () => unknown) => _assert.throws(fn),

        sameValue: (act: any, exp: any) => {
            if (act instanceof Uint8Array) {
                act = binJSON.decode(act);
                exp = _JSON.parse(exp);
            }
            // TS2775: Assertions require every name in the call target to be declared with an explicit type annotation.
            (_assert.deepEqual as any)(act, exp);
        }
    };

    const JSON = {
        stringify: (v: any) => binJSON.encode(v),
    };

    const Test262Error = Error;

    /**
     * Tests below are borrowed from Test262: ECMAScript Test Suite (ECMA TR/104)
     *
     * @see https://github.com/tc39/test262/tree/main/test/built-ins/JSON/stringify
     */

    /**
     * Abrupt completion from Get.
     */

    it("value-array-abrupt.js", () => {
        var abruptLength = new Proxy([], {
            get: function (_target, key) {
                if (key === 'length') {
                    throw new Test262Error();
                }
            },
        });

        assert.throws(Test262Error, function () {
            JSON.stringify(abruptLength);
        });

        var abruptToPrimitive = {
            valueOf: function () {
                throw new Test262Error();
            },
        };

        var abruptToLength = new Proxy([], {
            get: function (_target, key) {
                if (key === 'length') {
                    return abruptToPrimitive;
                }
            },
        });

        assert.throws(Test262Error, function () {
            JSON.stringify([abruptToLength]);
        });

        var abruptIndex = new Array(1);
        Object.defineProperty(abruptIndex, '0', {
            get: function () {
                throw new Test262Error();
            },
        });

        assert.throws(Test262Error, function () {
            JSON.stringify({key: abruptIndex});
        });
    });

    /**
     * Circular array value throws a TypeError.
     */

    it("value-array-circular.js", () => {
        var direct: any = [];
        direct.push(direct);

        assert.throws(TypeError, function () {
            JSON.stringify(direct);
        });

        var indirect: any = [];
        indirect.push([[indirect]]);

        assert.throws(TypeError, function () {
            JSON.stringify(indirect);
        });
    });

    /**
     * Circular array value throws a TypeError.
     */

    it("value-array-circular.js", () => {
        const direct: any[] = [];
        direct.push(direct);

        assert.throws(TypeError, function () {
            JSON.stringify(direct);
        });

        var indirect: any = [];
        indirect.push([[indirect]]);

        assert.throws(TypeError, function () {
            JSON.stringify(indirect);
        });
    });

    /**
     * Boolean objects are converted to primitives using [[BooleanData]].
     */

    it("value-boolean-object.js", () => {
        assert.sameValue(JSON.stringify(new Boolean(true)), 'true');

        assert.sameValue(
            JSON.stringify({
                toJSON: function () {
                    return {key: new Boolean(false)};
                },
            }),
            '{"key":false}'
        );
    });

    /**
     * Function values are ignored.
     */

    it("value-function.js", () => {
        assert.sameValue(JSON.stringify(function () {
        }), undefined);
        assert.sameValue(JSON.stringify([function () {
        }]), '[null]');
        assert.sameValue(JSON.stringify({
            key: function () {
            }
        }), '{}');
    });

    /**
     * Negative zero numbers are stringified to "0".
     */

    it("value-number-negative-zero.js", () => {
        assert.sameValue(JSON.stringify(-0), '0');
        assert.sameValue(JSON.stringify(['-0', 0, -0]), '["-0",0,0]');
        assert.sameValue(JSON.stringify({key: -0}), '{"key":0}');
    });

    /**
     * Non-finite numbers as serialized as null.
     */

    it("value-number-non-finite.js", () => {
        assert.sameValue(JSON.stringify(Infinity), 'null');
        assert.sameValue(JSON.stringify({key: -Infinity}), '{"key":null}');
        assert.sameValue(JSON.stringify([NaN]), '[null]');
    });

    /**
     * Number objects are converted to primitives using ToNumber.
     */

    it("value-number-object.js", () => {
        assert.sameValue(JSON.stringify(new Number(8.5)), '8.5');

        var abruptToJSON = function () {
            var num = new Number(3.14);
            num.toString = function () {
                throw new Test262Error();
            };
            num.valueOf = function () {
                throw new Test262Error();
            };
            return num;
        };

        assert.throws(Test262Error, function () {
            JSON.stringify({
                key: {
                    toJSON: abruptToJSON,
                },
            });
        });
    });

    /**
     * Abrupt completion from Get.
     */

    it("value-object-abrupt.js", () => {
        assert.throws(Test262Error, function() {
            JSON.stringify({
                get key() {
                    throw new Test262Error();
                },
            });
        });
    });

    /**
     * Circular object value throws a TypeError.
     */

    it("value-object-circular.js", () => {
        var direct: any = {};
        direct.prop = direct;

        assert.throws(TypeError, function () {
            JSON.stringify(direct);
        });

        var indirect = {
            p1: {
                p2: {
                    get p3() {
                        return indirect;
                    },
                },
            },
        };

        assert.throws(TypeError, function () {
            JSON.stringify(indirect);
        });
    });

    /**
     * Top-level primitive values are stringified correctly.
     */

    it("value-primitive-top-level.js", () => {
        assert.sameValue(JSON.stringify(null), 'null');
        assert.sameValue(JSON.stringify(true), 'true');
        assert.sameValue(JSON.stringify(false), 'false');
        assert.sameValue(JSON.stringify('str'), '"str"');
        assert.sameValue(JSON.stringify(123), '123');
        assert.sameValue(JSON.stringify(undefined), undefined);
    });

    /**
     * String exotic objects are converted to primitives using ToString.
     */

    it("value-string-object.js", () => {
        assert.sameValue(JSON.stringify(new String('str')), '"str"');

        var toJSON = function () {
            var str = new String('str');
            str.toString = function () {
                return 'toString';
            };
            str.valueOf = function () {
                throw new Test262Error('should not be called');
            };
            return str;
        };

        assert.sameValue(
            JSON.stringify({
                key: {
                    toJSON: toJSON,
                },
            }),
            '{"key":"toString"}'
        );
    });

    /**
     * Symbol primitives are ignored, both as keys and as values.
     */

    it("value-symbol.js", () => {
        var sym = Symbol('desc');
        assert.sameValue(JSON.stringify(sym), undefined);
        assert.sameValue(JSON.stringify([sym]), '[null]');
        assert.sameValue(JSON.stringify({key: sym}), '{}');

        var obj: any = {};
        obj[sym] = 1;
        assert.sameValue(JSON.stringify(obj), '{}');
    });

    /**
     * Abrupt completions from Get and Call.
     */

    it("value-tojson-abrupt.js", () => {
        assert.throws(Test262Error, function () {
            JSON.stringify({
                get toJSON() {
                    throw new Test262Error();
                },
            });
        });

        assert.throws(Test262Error, function () {
            JSON.stringify({
                toJSON() {
                    throw new Test262Error();
                },
            });
        });
    });

    /**
     * toJSON is called with correct context and arguments.
     */

    it("value-tojson-arguments.js", () => {
        var callCount = 0;
        var _this;
        var _key;
        var obj = {
            toJSON: function (key: any) {
                callCount += 1;
                _this = this;
                _key = key;
            },
        };
        _key; // TS6133: '_key' is declared but its value is never read.

        assert.sameValue(JSON.stringify(obj), undefined);
        assert.sameValue(callCount, 1);
        assert.sameValue(_this, obj);
        assert.sameValue(_key, "");

        assert.sameValue(JSON.stringify([1, obj, 3]), '[1,null,3]');
        assert.sameValue(callCount, 2);
        assert.sameValue(_this, obj);
        assert.sameValue(_key, "1");

        assert.sameValue(JSON.stringify({key: obj}), '{}');
        assert.sameValue(callCount, 3);
        assert.sameValue(_this, obj);
        assert.sameValue(_key, "key");
    });

    /**
     * Circular array value (returned from toJSON method) throws a TypeError.
     */

    it("value-tojson-array-circular.js", () => {
        var arr: any = [];
        var circular: any = [arr];

        arr.toJSON = function () {
            return circular;
        };

        assert.throws(TypeError, function () {
            JSON.stringify(circular);
        });
    });

    /**
     * toJSON value is not callable.
     */

    it("value-tojson-not-function.js", () => {
        assert.sameValue(JSON.stringify({toJSON: null}), '{"toJSON":null}');
        assert.sameValue(JSON.stringify({toJSON: false}), '{"toJSON":false}');
        assert.sameValue(JSON.stringify({toJSON: []}), '{"toJSON":[]}');
        assert.sameValue(JSON.stringify({toJSON: /re/}), '{"toJSON":{}}');
    });

    /**
     * Circular object value (returned from toJSON method) throws a TypeError.
     */

    it("value-tojson-object-circular.js", () => {
        var obj: any = {};
        var circular = {prop: obj};

        obj.toJSON = function () {
            return circular;
        };

        assert.throws(TypeError, function () {
            JSON.stringify(circular);
        });
    });

    /**
     * Result of toJSON method is stringified.
     */

    it("value-tojson-result.js", () => {
        assert.sameValue(
            JSON.stringify({
                toJSON: function () {
                    return [false];
                },
            }),
            '[false]'
        );

        var arr: any = [true];
        arr.toJSON = function () {
        };
        assert.sameValue(JSON.stringify(arr), undefined);

        var str: any = new String('str');
        str.toJSON = function (): null {
            return null;
        };
        assert.sameValue(JSON.stringify({key: str}), '{"key":null}');

        var num: any = new Number(14);
        num.toJSON = function () {
            return {key: 7};
        };
        assert.sameValue(JSON.stringify([num]), '[{"key":7}]');
    });
});
