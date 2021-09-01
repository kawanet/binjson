/**
 * @see https://github.com/kawanet/binjson
 */

import type {binjson} from "../types/binjson";
import {ReadDriver, ReadRoute, ReadRouter1, ReadRouterX} from "./read-route";
import {defaultReadRoute} from "./read-router";
import {WriteDriver, WriteRoute, WriteRouter1, WriteRouterX} from "./write-route";
import {defaultWriteRoute} from "./write-router";

export class Driver implements ReadDriver, WriteDriver {
    readRouter1: ReadRouter1;
    readRouterX: ReadRouterX;
    writeRouter1: WriteRouter1;
    writeRouterX: WriteRouterX;

    extend(options?: binjson.Options): Driver {
        const child = new Driver();
        updateReadRouter(child, this, options);
        updateWriteRouter(child, this, options);
        return child;
    }
}

const defaultWrite = defaultWriteRoute;
const defaultRead = defaultReadRoute;

function updateReadRouter(target: ReadDriver, base: ReadDriver, options: binjson.Options): void {
    let router1 = base?.readRouter1 || defaultRead.readRouter1;
    let routerX = base?.readRouterX || defaultRead.readRouterX;

    if (options?.handler) {
        const route = new ReadRoute({readRouter1: router1, readRouterX: routerX});
        route.add(options.handler);
        router1 = route.readRouter1;
        routerX = route.readRouterX;
    }

    target.readRouter1 = router1;
    target.readRouterX = routerX;
}

function updateWriteRouter(target: WriteDriver, base: WriteDriver, options: binjson.Options): void {
    let router1 = base?.writeRouter1 || defaultWrite.writeRouter1;
    let routerX = base?.writeRouterX || defaultWrite.writeRouterX;

    if (options?.handler) {
        const route = new WriteRoute({writeRouter1: router1, writeRouterX: routerX});
        route.add(options.handler);
        router1 = route.writeRouter1;
        routerX = route.writeRouterX;
    }

    target.writeRouter1 = router1;
    target.writeRouterX = routerX;
}
