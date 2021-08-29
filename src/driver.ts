/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {defaultReadRoute, ReadRoute, ReadRouter} from "./read-route";
import {defaultWriteRoute, WriteRoute, WriteRouter} from "./write-route";

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

function updateReadRouter(target: Driver, base: Driver, options: binjson.Options): void {
    let router = base?.readRouter || defaultReadRoute.router();

    if (options?.handler) {
        const route = new ReadRoute();
        route.add(options.handler);
        router = route.router(router);
    }

    target.readRouter = router;
}

function updateWriteRouter(target: Driver, base: Driver, options: binjson.Options): void {
    let router = base?.writeRouter || defaultWriteRoute.router();

    if (options?.handler) {
        const route = new WriteRoute();
        route.add(options.handler);
        router = route.router(router);
    }

    target.writeRouter = router;
}
