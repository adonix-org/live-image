import { GET, Method } from "@adonix.org/cloud-spark";
import { SourceWorker, SourceContext } from "../source";
import { websocket } from "@adonix.org/cloud-spark/websocket";

export abstract class WebSocketWorker extends SourceWorker {
    protected get method(): Method {
        return GET;
    }

    protected override init(): void {
        super.init();
        this.use(websocket());
    }

    protected async process(context: SourceContext): Promise<Response> {
        return context.stub.fetch(this.request);
    }
}
