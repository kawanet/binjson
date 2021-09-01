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
    let router1 = base?.readRouter1 || defaultRead.router1();
    let routerX = base?.readRouterX || defaultRead.routerX();

    if (options?.handler) {
        const route = new ReadRoute();
        route.add(options.handler);
        router1 = route.router1(router1);
        routerX = route.routerX(routerX);
    }

    target.readRouter1 = router1;
    target.readRouterX = routerX;
}

function updateWriteRouter(target: WriteDriver, base: WriteDriver, options: binjson.Options): void {
    let router1 = base?.writeRouter1 || defaultWrite.router1();
    let routerX = base?.writeRouterX || defaultWrite.routerX();

    if (options?.handler) {
        const route = new WriteRoute();
        route.add(options.handler);
        router1 = route.router1(router1);
        routerX = route.routerX(routerX);
    }

    target.writeRouter1 = router1;
    target.writeRouterX = routerX;
}
