import { GET, RouteTuple } from "@adonix.org/cloud-spark";

import { auth } from "../../middleware/auth";

import { WebSocketBase } from "./base";

export class Publisher extends WebSocketBase {
    public static override readonly ROUTE: RouteTuple = [GET, "/publisher/:source", this];

    protected override init(): void {
        super.init();
        this.use(auth());
    }
}
