import { websocket } from "@adonix.org/cloud-spark/websocket";

import { SourceContext, SourceWorker } from "../source";

export abstract class WebSocketBase extends SourceWorker {
    protected override init(): void {
        super.init();
        this.use(websocket(this.getRoute()[1]));
    }

    protected override async respond(context: SourceContext): Promise<Response> {
        return context.stub.fetch(this.request);
    }
}
