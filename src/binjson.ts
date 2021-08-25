/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {initDecode, ReadRouter} from "./decode";
import {initEncode, WriteRouter} from "./encode";

function init(options?: binjson.Options, readRouter?: ReadRouter, writeRouter?: WriteRouter): binjson.IBinJSON<Uint8Array> {

    /**
     * binJSON.create() method inherits the current readRouter and writeRouter.
     */
    const create = (options?: binjson.Options): binjson.IBinJSON<Uint8Array> => init(options, readRouter, writeRouter);

    const decode = initDecode(options, readRouter);

    const encode = initEncode(options, writeRouter);

    return {create, decode, encode};
}

export const binJSON = init();
