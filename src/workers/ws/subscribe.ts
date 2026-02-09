import { GET, RouteTuple } from "@adonix.org/cloud-spark";

import { WebSocketWorker } from "./worker";

export class Subscribe extends WebSocketWorker {
    public static readonly ROUTE: RouteTuple = [GET, "/subscribe/:source", Subscribe];

    protected override getRoute(): RouteTuple {
        return Subscribe.ROUTE;
    }
}
