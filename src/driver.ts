/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {initReadRouter, ReadRoute, ReadRouter} from "./read-route";
import {initWriteRouter, WriteRoute, WriteRouter} from "./write-route";

export class Driver {
    readRouter: ReadRouter;
    writeRouter: WriteRouter;

    extend(options?: binjson.Options): Driver {
        const child = new Driver();
        updateReadRouter(child, this, options);
        updateWriteRouter(child, this, options);
        return child;
    }
}

let defaultReadRouter: ReadRouter;

function updateReadRouter(target: Driver, base: Driver, options: binjson.Options): void {
    let router = base?.readRouter || defaultReadRouter || (defaultReadRouter = initReadRouter());

    if (options?.handler) {
        const route = new ReadRoute();
        route.add(options.handler);
        router = route.router(router);
    }

    target.readRouter = router;
}

let defaultWriteRouter: WriteRouter;

function updateWriteRouter(target: Driver, base: Driver, options: binjson.Options): void {
    let router = base?.writeRouter || defaultWriteRouter || (defaultWriteRouter = initWriteRouter());

    if (options?.handler) {
        const route = new WriteRoute();
        route.add(options.handler);
        router = route.router(router);
    }

    target.writeRouter = router;
}
