import { DELETE, GET, HEAD, Method, OPTIONS, POST, RouteWorker } from "@adonix.org/cloud-spark";

import { Routes } from "../routes";

export class LiveImage extends RouteWorker {
    constructor(request: Request, env: Env, ctx: ExecutionContext) {
        const headers = new Headers(request.headers);
        headers.delete("cache-control");
        headers.delete("pragma");
        headers.delete("accept-language");

        super(new Request(request, { headers }), env, ctx);
    }

    protected override init(): void {
        this.routes(Routes);
    }

    public override getAllowedMethods(): Method[] {
        return [DELETE, GET, HEAD, OPTIONS, POST];
    }
}
