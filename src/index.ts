import {
    DELETE,
    GET,
    HEAD,
    Method,
    OPTIONS,
    POST,
    RouteWorker,
} from "@adonix.org/cloud-spark";
import { ImageStore } from "./image-store";
import { Routes } from "./routes";

class LiveImage extends RouteWorker {
    protected override init(): void {
        this.routes(Routes);
    }

    public override getAllowedMethods(): Method[] {
        return [DELETE, GET, HEAD, OPTIONS, POST];
    }
}

export { ImageStore };

export default LiveImage.ignite();
