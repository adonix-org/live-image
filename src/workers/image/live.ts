import { RouteWorker, Method, DELETE, GET, HEAD, OPTIONS, POST } from "@adonix.org/cloud-spark";
import { Routes } from "../../routes";

export class LiveImage extends RouteWorker {
    protected override init(): void {
        this.routes(Routes);
    }

    public override getAllowedMethods(): Method[] {
        return [DELETE, GET, HEAD, OPTIONS, POST];
    }
}
