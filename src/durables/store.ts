import { DurableObject } from "cloudflare:workers";

import { EventBroker } from "./broker";

export interface ImageData {
    id: number;
    image: ArrayBuffer;
    mediaType: string;
}

export class ImageStore extends DurableObject {
    private static readonly KEY = "image:data";
    private readonly broker: EventBroker;
    private data: ImageData | undefined;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.broker = new EventBroker(ctx);

        this.ctx.blockConcurrencyWhile(async () => {
            this.data = await this.ctx.storage.get<ImageData>(this.getKey());
        });
    }

    protected getKey(): string {
        return ImageStore.KEY;
    }

    public get(): ImageData | undefined {
        return this.data;
    }

    public async put(image: ArrayBuffer, mediaType: string): Promise<void> {
        const data = {
            id: Date.now(),
            image,
            mediaType,
        };
        await this.ctx.storage.put<ImageData>(this.getKey(), data);
        this.data = data;
        this.broker.notify(this.data.id);
    }

    public async delete(): Promise<void> {
        await this.ctx.storage.delete(this.getKey());
        this.broker.notify(0);
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
}
