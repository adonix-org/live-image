import { NotFound, WebSocketUpgrade } from "@adonix.org/cloud-spark";
import { Publishers, Sessions, Subscribers } from "./sessions";

export class EventBroker {
    private static readonly SUBSCRIBE = "subscribe";
    private static readonly PUBLISH = "publish";

    private readonly subscribers = new Subscribers();
    private readonly publishers = new Publishers();

    constructor(protected readonly ctx: DurableObjectState) {
        this.subscribers.restoreAll(this.ctx.getWebSockets(EventBroker.SUBSCRIBE));
        this.publishers.restoreAll(this.ctx.getWebSockets(EventBroker.PUBLISH));
    }

    public onFetch(request: Request): Promise<Response> {
        const path = new URL(request.url).pathname;
        if (path.startsWith(`/${EventBroker.PUBLISH}/`)) {
            return this.publisher();
        }
        if (path.startsWith(`/${EventBroker.SUBSCRIBE}/`)) {
            return this.subscriber();
        }
        return new NotFound().response();
    }

    public onMessage(ws: WebSocket, message: string): void {
        this.subscribers.acknowledge(ws);
    }

    public onClose(ws: WebSocket, code: number, reason: string): void {
        if (!this.subscribers.close(ws, code, reason)) {
            this.publishers.close(ws, code, reason);
        }
        this.publishers.online(this.subscribers);
    }

    public notify(): void {
        this.subscribers.publish();
        this.publishers.online(this.subscribers);
    }

    private publisher(): Promise<Response> {
        return this.connect(this.publishers, EventBroker.PUBLISH);
    }

    private subscriber(): Promise<Response> {
        return this.connect(this.subscribers, EventBroker.SUBSCRIBE);
    }

    private connect(sessions: Sessions, type: string): Promise<Response> {
        const client = sessions.create().acceptWebSocket(this.ctx, [type]);
        this.publishers.online(this.subscribers);
        return new WebSocketUpgrade(client).response();
    }
}
