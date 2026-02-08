import { NotFound, WebSocketUpgrade } from "@adonix.org/cloud-spark";
import { Publishers, Sessions, Subscribers } from "./sessions";

const EventType = {
    SUBSCRIBE: "subscribe",
    PUBLISH: "publish",
} as const;

type EventType = (typeof EventType)[keyof typeof EventType];

export class EventBroker {
    private readonly subscribers = new Subscribers();
    private readonly publishers = new Publishers();

    constructor(protected readonly ctx: DurableObjectState) {
        this.subscribers.restoreAll(this.ctx.getWebSockets(EventType.SUBSCRIBE));
        this.publishers.restoreAll(this.ctx.getWebSockets(EventType.PUBLISH));
    }

    public onFetch(request: Request): Promise<Response> {
        const path = new URL(request.url).pathname;
        if (path.startsWith(`/${EventType.PUBLISH}/`)) {
            return this.publisher();
        }
        if (path.startsWith(`/${EventType.SUBSCRIBE}/`)) {
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
        return this.connect(this.publishers, EventType.PUBLISH);
    }

    private subscriber(): Promise<Response> {
        return this.connect(this.subscribers, EventType.SUBSCRIBE);
    }

    private connect(sessions: Sessions, type: EventType): Promise<Response> {
        const client = sessions.create().acceptWebSocket(this.ctx, [type]);
        this.publishers.online(this.subscribers);
        return new WebSocketUpgrade(client).response();
    }
}
