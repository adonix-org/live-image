import { GET, RouteTuple } from "@adonix.org/cloud-spark";

import { WebSocketBase } from "./base";

export class Subscribe extends WebSocketBase {
    public static override readonly ROUTE: RouteTuple = [GET, "/subscribe/:source", this];
}
