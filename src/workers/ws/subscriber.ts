import { GET, RouteTuple } from "@adonix.org/cloud-spark";

import { WebSocketBase } from "./base";

export class Subscriber extends WebSocketBase {
    public static override readonly ROUTE: RouteTuple = [GET, "/subscriber/:source", this];
}
