import { GET, NotFound, PathParams, RouteTuple, RouteWorker } from "@adonix.org/cloud-spark";

import { auth } from "../../middleware/auth";

class StreamWorker extends RouteWorker {
    protected async connect(params: PathParams): Promise<Response> {
        const source = params["source"];
        if (!source) {
            return this.response(NotFound, "path is missing source.");
        }

        return this.env.IMAGE_STREAM.getByName(source).fetch(this.request);
    }
}

export class Broadcast extends StreamWorker {
    public static readonly ROUTE: RouteTuple = [GET, "/broadcast/:source", this];

    protected override init(): void {
        super.init();

        this.use(auth());

        this.route(Listen.ROUTE[0], Broadcast.ROUTE[1], this.connect);
    }
}

export class Listen extends StreamWorker {
    public static readonly ROUTE: RouteTuple = [GET, "/listen/:source", this];

    protected override init(): void {
        super.init();

        this.route(Listen.ROUTE[0], Listen.ROUTE[1], this.connect);
    }
}
