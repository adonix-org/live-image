import { auth } from "../middleware/authorization";
import { Paths } from "../routes";
import { WebSocketWorker } from "./websocket-worker";

export class Publish extends WebSocketWorker {
    protected get path(): string {
        return Paths.publish;
    }

    protected override init(): void {
        super.init();
        this.use(auth());
    }
}
