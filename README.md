# binjson - Binary JSON

[![Node.js CI](https://github.com/kawanet/binjson/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/binjson/actions/)
[![npm version](https://img.shields.io/npm/v/binjson)](https://www.npmjs.com/package/binjson)
[![minified size](https://img.shields.io/bundlephobia/min/binjson)](https://cdn.jsdelivr.net/npm/binjson/dist/binjson.min.js)

- `Uint8Array`, `ArrayBuffer`, `TypedArray`s supported as well as node.js' `Buffer`
- `toJSON` method supported including `Date.prototype.toJSON`
- extensible to encode/decode your own class content
- human-readable binary representation in some cases

## SYNOPSIS

```js
const {binJSON} = require("binjson");

const src = {text: "string", data: new Uint8Array([1, 2, 3, 4])};
const bin = binJSON.encode(src); // => Uint8Array
const obj = binJSON.decode(bin); // => object
(obj.data instanceof Uint8Array); // => true
```

Good old `JSON.stringify()` does not support binary on the other hand.

```js
const src = {text: "string", data: new Uint8Array([1, 2, 3, 4])};
const json = JSON.stringify(src); // => string
const obj = bufJSON.decode(json); // => object
(obj.data instanceof Uint8Array); // => false
```

### Node.js

`bufJSON` is a [Buffer](https://nodejs.org/api/buffer.html) version of `binJSON` for Node.js.

```js
const {bufJSON} = require("binjson");

const src = {text: "string", data: Buffer.from([1, 2, 3, 4])};
const buf = bufJSON.encode(src); // => Buffer
const obj = bufJSON.decode(buf); // => object
(obj.data instanceof Buffer); // => true
```

## EXTENSION

`binJSON` is extensible to serialize your own class content.

```js
const {bufJSON} = require("binjson");
const {murmur3} = require("murmurhash-js");

class MyClass {
  // something here
}

const handlerX = {
  tagX: murmur3(MyClass.name), // => 0x50bdf49f
  match: v => (v instanceof MyClass),
  encode: v => v.internalValue,
  decode: v => new MyClass(v),
};

const codec = binJSON.extend({handler: handlerX});
const src = {data: new MyClass()};
const bin = codec.encode(src); // => Uint8Array
const obj = codec.decode(bin); // => object
(obj.data instanceof MyClass); // => true
```

## FORMAT

Surprisingly, binJSON encoded binary data is still **human-readable** as a string in some cases.

```js
bufJSON.encode(true).toString(); // => "T"
bufJSON.encode(false).toString(); // => "F"
bufJSON.encode(null).toString(); // => "?"
bufJSON.encode(0).toString(); // => "0"
bufJSON.encode(9).toString(); // => "9"
bufJSON.encode([1, 2, 3]).toString(); // => "(123)"
bufJSON.encode("").toString(); // => "`"
bufJSON.encode("FOO").toString(); // => "cFOO"
bufJSON.encode({BAR: true}).toString(); // => "<TcBAR>"
bufJSON.encode({BUZ: ["A", "AB", "ABC"]}).toString(); // => "<(aAbABcABC)cBUZ>"
```

Following value types however are encoded as a raw binary. Most of us could not read them.

- positive number larger than 9
- negative number
- floating number
- string longer than 31 bytes
- binary data

### Tag

Single byte uint8 `tag` number represents primitive value types as below:

| name | tag | hex | JavaScript | payload |
|----|----|----|----|----|
| kPadding | `\0` | `00` | N/A ||
| kUndefined | `_` | `5F` | undefined ||
| kNull | `?` | `3F` | null ||
| kTrue | `T` | `54` | boolean ||
| kFalse | `F` | `46` | boolean ||
| kInt32 | `I` | `49 xx xx xx xx` | number | int32 |
| kDouble | `N` | `4E xx xx xx xx xx xx xx xx` | number | float64 |
| kBigInt | `Z` | `5A ...` | BigInt | string packet |
| kArrayBegin | `(` | `28 ... 29` | `[` | any packets |
| kArrayEnd | `)` | `29` | `]` ||
| kObjectBegin | `<` | `3C ... 3E` | `{` | any packets |
| kObjectEnd | `>` | `3E` | `}` ||
| kNumber0 | `0` - `9` | `30` - `39` | number ||
| kString0 | (96 - 255) | `60` - `FF ...` | string | UTF-8 |
| kString16 | `S` | `53 hh hh ...` | string | UTF-8 |
| kString32 | `^S` | `13 hh hh hh hh ...` | string | UTF-8 |
| kBinary16 | `B` | `42 hh hh ...` | (Binary) | binary data |
| kBinary32 | `^B` | `02 hh hh hh hh ...` | (Binary) | binary data |
| kExtension | `$` | `24 hh hh hh hh ...` | object | any packet |
| (reserved) | (27 - 31) | `1B` `1C` `1D` `1E` `1F` | N/A ||

Tag `1B` to `1F` are reserved for your app's internal purpose.
E.g., test scripts use them for testing purpose.

### TagX

4 byte uint32 `tagX` number represents type of encapsulated object payload.

| object | tagX | hex | payload |
|----|----|----|----|
| Date | `0xfaaabc6e` | `24 FA AA BC 6E 4E ...` | kDouble |
| RegExp | `0xa92ae3dc` | `24 A9 2A E3 DC 28 ... 29` | kArrayBegin |
| Map | `0x441c30df` | `24 44 1C 30 DF 28 ... 29` | kArrayBegin |
| Set | `0xf18ec750` | `24 F1 8E C7 50 28 ... 29` | kArrayBegin |
| ArrayBuffer | `0x3c63bb3b` | `24 3C 63 BB 3B x2 hh ...` | kBinary16 / kBinary32 |
| Int8Array | `0x534d6419` | `24 53 4D 64 19 x2 hh ...` | kBinary16 / kBinary32 |
| Uint8Array | `0xe6ed42fd` | `24 E6 ED 42 FD x2 hh ...` | kBinary16 / kBinary32 |
| Uint8ClampedArray | `0x63086993` | `24 63 08 69 93 x2 hh ...` | kBinary16 / kBinary32 |
| Int16Array | `0x459339fd` | `24 45 93 39 FD x2 hh ...` | kBinary16 / kBinary32 |
| Uint16Array | `0x0b02c6d5` | `24 0B 02 C6 D5 x2 hh ...` | kBinary16 / kBinary32 |
| Int32Array | `0xb90d6346` | `24 B9 0D 63 46 x2 hh ...` | kBinary16 / kBinary32 |
| Uint32Array | `0xf98dfe49` | `24 F9 8D FE 49 x2 hh ...` | kBinary16 / kBinary32 |
| Float32Array | `0x1b5216be` | `24 1B 52 16 BE x2 hh ...` | kBinary16 / kBinary32 |
| Float64Array | `0xc1345a24` | `24 C1 34 5A 24 x2 hh ...` | kBinary16 / kBinary32 |
| BigInt64Array | `0x9b40476b` | `24 9B 40 47 6B x2 hh ...` | kBinary16 / kBinary32 |
| BigUint64Array | `0xdf2709d1` | `24 DF 27 09 D1 x2 hh ...` | kBinary16 / kBinary32 |
| DataView | `0xd3ad5ca2` | `24 D3 AD 5C A2 x2 hh ...` | kBinary16 / kBinary32 |
| Buffer | `0x2cceb034` | `24 2C CE B0 34 x2 hh ...` | kBinary16 / kBinary32 |

TagX is any number of your choice or simply given via Murmur3 (MurmurHash v3) digest hash function.
[murmurhash-js](https://www.npmjs.com/package/murmurhash-js) would work great for the hash calculation.

## LINKS

- https://github.com/kawanet/binjson
- https://www.npmjs.com/package/binjson
- https://www.npmjs.com/package/murmurhash-js
