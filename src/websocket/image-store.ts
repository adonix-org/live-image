import { NotFound, WebSocketUpgrade } from "@adonix.org/cloud-spark";
import { WebSocketSessions } from "@adonix.org/cloud-spark/sessions";
import { DurableObject } from "cloudflare:workers";
import { Publishers, Subscribers } from "./sessions";

export class ImageStore extends DurableObject {
    private static readonly KEY = "image:array";
    private static readonly SUBSCRIBE = "subscribe";
    private static readonly PUBLISH = "publish";

    private readonly subscribers = new Subscribers();
    private readonly publishers = new Publishers();

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.subscribers.restoreAll(this.ctx.getWebSockets(ImageStore.SUBSCRIBE));
        this.publishers.restoreAll(this.ctx.getWebSockets(ImageStore.PUBLISH));
    }

    protected getKey(): string {
        return ImageStore.KEY;
    }

    public async put(image: ArrayBuffer): Promise<void> {
        await this.ctx.storage.put<ArrayBuffer>(this.getKey(), image);
        this.subscribers.publish();
        this.publishers.online(this.subscribers);
    }

    public async get(): Promise<ArrayBuffer | undefined> {
        return this.ctx.storage.get<ArrayBuffer>(this.getKey());
    }

    public async delete(): Promise<void> {
        await this.ctx.storage.delete(this.getKey());
        this.subscribers.publish();
        this.publishers.online(this.subscribers);
    }

    public override fetch(request: Request): Promise<Response> {
        const path = new URL(request.url).pathname;
        if (path.startsWith(`/${ImageStore.PUBLISH}/`)) {
            return this.publisher();
        }
        if (path.startsWith(`/${ImageStore.SUBSCRIBE}/`)) {
            return this.subscriber();
        }
        return new NotFound().response();
    }

    private publisher(): Promise<Response> {
        return this.connect(this.publishers, ImageStore.PUBLISH);
    }

    private subscriber(): Promise<Response> {
        return this.connect(this.subscribers, ImageStore.SUBSCRIBE);
    }

    private connect(sessions: WebSocketSessions, type: string): Promise<Response> {
        const client = sessions.create().acceptWebSocket(this.ctx, [type]);
        this.publishers.online(this.subscribers);
        return new WebSocketUpgrade(client).response();
    }

    private close(ws: WebSocket, code: number, reason: string): void {
        if (!this.subscribers.close(ws, code, reason)) {
            this.publishers.close(ws, code, reason);
        }
        this.publishers.online(this.subscribers);
    }

    public override webSocketMessage(ws: WebSocket, message: string): void {
        this.subscribers.acknowledge(ws);
    }

    public override webSocketClose(ws: WebSocket, code: number, reason: string): void {
        this.close(ws, code, reason);
    }

    public override webSocketError(ws: WebSocket, error: unknown): void {
        console.error(error);
        this.close(ws, 1011, String(error));
    }
}
