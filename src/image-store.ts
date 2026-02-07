import { NotFound, WebSocketUpgrade } from "@adonix.org/cloud-spark";
import { WebSocketSessions } from "@adonix.org/cloud-spark/sessions";
import { DurableObject } from "cloudflare:workers";

export class ImageStore extends DurableObject {
    private static readonly KEY = "image:array";
    private static readonly SUBSCRIBE = "subscribe";
    private static readonly PUBLISH = "publish";

    private subscribers = new WebSocketSessions();
    private publishers = new WebSocketSessions();

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
        this.broadcast(
            JSON.stringify({
                message: "image",
                size: image.byteLength,
                timestamp: new Date().toISOString(),
            }),
        );
    }

    public async get(): Promise<ArrayBuffer | undefined> {
        return this.ctx.storage.get<ArrayBuffer>(this.getKey());
    }

    public async delete(): Promise<void> {
        await this.ctx.storage.delete(this.getKey());
        this.broadcast(
            JSON.stringify({
                message: "image",
                size: 0,
                timestamp: new Date().toISOString(),
            }),
        );
    }

    public override fetch(request: Request): Promise<Response> {
        const path = new URL(request.url).pathname;
        if (path.startsWith(`/${ImageStore.PUBLISH}/`)) {
            return this.publish();
        }
        if (path.startsWith(`/${ImageStore.SUBSCRIBE}/`)) {
            return this.subscribe();
        }
        return new NotFound().response();
    }

    private publish(): Promise<Response> {
        return this.connect(this.publishers, ImageStore.PUBLISH);
    }

    private subscribe(): Promise<Response> {
        return this.connect(this.subscribers, ImageStore.SUBSCRIBE);
    }

    private connect(sessions: WebSocketSessions, type: string): Promise<Response> {
        const client = sessions.create().acceptWebSocket(this.ctx, [type]);

        this.notify(JSON.stringify({ subscribers: this.subscribers.size }));
        return new WebSocketUpgrade(client).response();
    }

    public broadcast(message: string): void {
        for (const session of this.subscribers) {
            try {
                session.send(message);
            } catch (error) {
                console.error(error);
                session.close(1011, String(error));
            }
        }
    }

    public notify(message: string): void {
        for (const session of this.publishers) {
            try {
                session.send(message);
            } catch (error) {
                console.error(error);
                session.close(1011, String(error));
            }
        }
    }

    private close(ws: WebSocket, code: number, reason: string): void {
        if (this.subscribers.close(ws, code, reason)) {
            this.notify(JSON.stringify({ subscribers: this.subscribers.size }));
        } else {
            this.publishers.close(ws, code, reason);
        }
    }

    public override webSocketMessage(ws: WebSocket, message: string): void {
        if (this.publishers.get(ws)) {
            this.broadcast(message);
            return;
        }

        // Subscribers should not be sending messages.
        const subscriber = this.subscribers.get(ws);
        if (subscriber) subscriber.close(1008, "Policy Violation");
    }

    public override webSocketClose(ws: WebSocket, code: number, reason: string): void {
        this.close(ws, code, reason);
    }

    public override webSocketError(ws: WebSocket, error: unknown): void {
        console.error(error);
        this.close(ws, 1011, String(error));
    }
}
