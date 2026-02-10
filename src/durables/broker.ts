import { NotFound, WebSocketUpgrade } from "@adonix.org/cloud-spark";

import { Publishers, Sessions, Subscribers } from "./sessions";

const Role = {
    SUBSCRIBE: "subscribe",
    PUBLISH: "publish",
} as const;

type Role = (typeof Role)[keyof typeof Role];

export class EventBroker {
    private readonly subscribers = new Subscribers();
    private readonly publishers = new Publishers();

    constructor(protected readonly ctx: DurableObjectState) {
        this.publishers.restoreAll(this.ctx.getWebSockets(Role.PUBLISH));
        this.subscribers.restoreAll(this.ctx.getWebSockets(Role.SUBSCRIBE));
    }

    public onFetch(request: Request): Promise<Response> {
        const path = new URL(request.url).pathname;
        if (path.startsWith(`/${Role.PUBLISH}/`)) {
            return this.connect(this.publishers, Role.PUBLISH);
        }
        if (path.startsWith(`/${Role.SUBSCRIBE}/`)) {
            return this.connect(this.subscribers, Role.SUBSCRIBE);
        }
        return new NotFound().response();
    }

    public onMessage(ws: WebSocket): void {
        this.subscribers.acknowledge(ws);
    }

    public onClose(ws: WebSocket, code: number, reason: string): void {
        if (!this.subscribers.close(ws, code, reason)) {
            this.publishers.close(ws, code, reason);
        }
        this.publishers.online(this.subscribers);
    }

    public notify(id: number): void {
        this.subscribers.publish(id);
        this.publishers.online(this.subscribers);
    }

    private connect(sessions: Sessions, type: Role): Promise<Response> {
        const client = sessions.create().acceptWebSocket(this.ctx, [type]);
        this.publishers.online(this.subscribers);
        return new WebSocketUpgrade(client).response();
    }
}
