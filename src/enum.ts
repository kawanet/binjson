/**
 * @see https://github.com/kawanet/binjson
 */

export const enum defaults {
    initialBufferSize = 2048,
}

/**
 * uint8 tag number for Handler1
 */

export const enum Tag {
    kUndefined = 0x5f, // _
    kTrue = 0x54, // T
    kFalse = 0x46, // F
    kInt32 = 0x49, // I
    kDouble = 0x44, // D
    kBigInt = 0x5A, // Z

    kNull = 0x3F, // ?
    kNumber0 = 0x30, // 0
    kString0 = 0x60, // `
    kString16 = 0x53, // S
    kString32 = 0x13, // ^S
    kBinary16 = 0x42, // B
    kBinary32 = 0x02, // ^B
    kObjectBegin = 0x3C, // <
    kObjectEnd = 0x3E, // >
    kArrayBegin = 0x28, // (
    kArrayEnd = 0x29, // )
    kExtension = 0x24, // $
}

/**
 * uint32 tag number for HandlerX
 *
 * @example
 * node -e "console.log(require('murmurhash-js')(process.argv[1]).toString(16))" "ClassName"
 */

export const enum TagX {
    Date = 0xfaaabc6e,
    RegExp = 0xa92ae3dc,
    Map = 0x441c30df,
    Set = 0xf18ec750,
    ArrayBuffer = 0x3c63bb3b,
    Int8Array = 0x534d6419,
    Uint8Array = 0xe6ed42fd,
    Uint8ClampedArray = 0x63086993,
    Int16Array = 0x459339fd,
    Uint16Array = 0x0b02c6d5,
    Int32Array = 0xb90d6346,
    Uint32Array = 0xf98dfe49,
    Float32Array = 0x1b5216be,
    Float64Array = 0xc1345a24,
    BigInt64Array = 0x9b40476b,
    BigUint64Array = 0xdf2709d1,
    DataView = 0xd3ad5ca2,
    Buffer = 0x2cceb034,
}
