import { DurableObject } from "cloudflare:workers";
import { EventBroker } from "./broker";

export class ImageStore extends DurableObject {
    private static readonly KEY = "image:array";
    private readonly broker: EventBroker;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.broker = new EventBroker(ctx);
    }

    protected getKey(): string {
        return ImageStore.KEY;
    }

    public async put(image: ArrayBuffer): Promise<void> {
        await this.ctx.storage.put<ArrayBuffer>(this.getKey(), image);
        this.broker.notify();
    }

    public async get(): Promise<ArrayBuffer | undefined> {
        return this.ctx.storage.get<ArrayBuffer>(this.getKey());
    }

    public async delete(): Promise<void> {
        await this.ctx.storage.delete(this.getKey());
        this.broker.notify();
    }

    public override fetch(request: Request): Promise<Response> {
        return this.broker.onFetch(request);
    }

    public override webSocketMessage(ws: WebSocket, message: string): void {
        this.broker.onMessage(ws, message);
    }

    public override webSocketClose(ws: WebSocket, code: number, reason: string): void {
        this.broker.onClose(ws, code, reason);
    }

    public override webSocketError(ws: WebSocket, error: unknown): void {
        console.error(error);
        this.broker.onClose(ws, 1011, String(error));
    }
}
