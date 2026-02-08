import { Paths } from "../routes";
import { WebSocketWorker } from "./websocket-worker";

export class Subscribe extends WebSocketWorker {
    protected get path(): string {
        return Paths.subscribe;
    }
}
