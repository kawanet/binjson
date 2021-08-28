/**
 * @see https://github.com/kawanet/binjson
 */

export const enum defaults {
    initialBufferSize = 2048,
}

export const enum PacketType {
    sizeMask = 0x7f,
    payload7 = 0x00,
    payload7max = 0x80 - 5,
    payload16 = 0x80 - 2,
    payload16max = 0xffff,
    payload32 = 0x80 - 4,
    packet7 = 0x80,
    packet7max = 0x100 - 5,
    packet16 = 0x100 - 2,
    packet16max = 0xffff,
    packet32 = 0x100 - 4,
}

/**
 * Tag: uint8
 */

export const enum Tag {
    // SerializationTag
    // https://github.com/v8/v8/blob/master/src/objects/value-serializer.cc
    kUndefined = 0x5f, // _
    kTrue = 0x54, // T
    kFalse = 0x46, // F
    kInt32 = 0x49, // I
    kDouble = 0x4E, // N
    kBigInt = 0x5A, // Z

    // original
    kNull = 0x3F, // ?
    kNumber0 = 0x30, // 0
    kString0 = 0x60, // `
    kString16 = 0x53, // S
    kString32 = 0x13, // ^S
    kWideString16 = 0x57, // W
    kWideString32 = 0x17, // ^W
    kBinary16 = 0x42, // B
    kBinary32 = 0x02, // ^B
    kObjectBegin = 0x3C, // <
    kObjectEnd = 0x3E, // >
    kArrayBegin = 0x28, // (
    kArrayEnd = 0x29, // )
    kExt4 = 0x24, // $

    // deprecated
    kDate = 0x44, // D
    kRegExp = 0x52, // R
    kArrayBufferView = 0x56, // V
    kNodeBuffer = 0x08, // '\b'
}

/**
 * SubTag: uint32
 *
 * @example
 * node -e "console.log(require('murmurhash-js')(process.argv[1]).toString(16))" "Date"
 */

export const enum SubTag {
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

export const enum ArrayBufferViewTag {
    kInt8Array = 0x62, // b
    kUint8Array = 0x42, // B
    kUint8ClampedArray = 0x43, // C
    kInt16Array = 0x77, // w
    kUint16Array = 0x57, // W
    kInt32Array = 0x64, // d
    kUint32Array = 0x44, // D
    kFloat32Array = 0x66, // f
    kFloat64Array = 0x46, // F
    kBigInt64Array = 0x71, // q
    kBigUint64Array = 0x51, // Q
    kDataView = 0x3F, // ?
}
