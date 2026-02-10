import { GET, RouteTuple } from "@adonix.org/cloud-spark";

import { auth } from "../../middleware/auth";

import { WebSocketBase } from "./base";

export class Publish extends WebSocketBase {
    public static readonly ROUTE: RouteTuple = [GET, "/publish/:source", this];

    protected override init(): void {
        super.init();
        this.use(auth());
    }
}
