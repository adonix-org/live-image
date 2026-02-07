import { Paths } from "../routes";
import { WebSocketWorker } from "./worker";

export class Subscribe extends WebSocketWorker {
    protected get path(): string {
        return Paths.subscribe;
    }
}
