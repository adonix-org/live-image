import { websocket } from "@adonix.org/cloud-spark/websocket";

import { SourceWorker, SourceContext } from "../source";

export abstract class WebSocketWorker extends SourceWorker {
    protected override init(): void {
        super.init();
        this.use(websocket());
    }

    protected override async respond(context: SourceContext): Promise<Response> {
        return context.stub.fetch(this.request);
    }
}
