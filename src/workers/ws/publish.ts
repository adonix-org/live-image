import { GET, RouteTuple } from "@adonix.org/cloud-spark";

import { auth } from "../../middleware/auth";
import { WebSocketWorker } from "./worker";

export class Publish extends WebSocketWorker {
    public static readonly ROUTE: RouteTuple = [GET, "/publish/:source", Publish];

    protected override getRoute(): RouteTuple {
        return Publish.ROUTE;
    }

    protected override init(): void {
        super.init();
        this.use(auth());
    }
}
