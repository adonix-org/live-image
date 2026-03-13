import { NotFound, WebSocketUpgrade } from "@adonix.org/cloud-spark";
import { WebSocketSessions } from "@adonix.org/cloud-spark/sessions";
import { DurableObject } from "cloudflare:workers";

export class ImageStream extends DurableObject {
    private broadcasters = new WebSocketSessions();
    private listeners = new WebSocketSessions();

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);

        this.broadcasters.restoreAll(ctx.getWebSockets("broadcaster"));
        this.listeners.restoreAll(ctx.getWebSockets("listener"));
    }

    public override fetch(request: Request): Promise<Response> {
        const path = new URL(request.url).pathname;
        if (path.startsWith(`/broadcast/`)) {
            return this.connect(this.broadcasters, "broadcaster");
        }
        if (path.startsWith(`/listen/`)) {
            return this.connect(this.listeners, "listener");
        }

        return new NotFound().response();
    }

    private connect(sessions: WebSocketSessions, tag: string): Promise<Response> {
        const client = sessions.create().acceptWebSocket(this.ctx, [tag]);
        return new WebSocketUpgrade(client).response();
    }

    public override webSocketMessage(ws: WebSocket, message: ArrayBuffer): void {
        const broadcaster = this.broadcasters.get(ws);
        if (!broadcaster) {
            ws.close();
        }

        for (const listener of this.listeners) {
            listener.send(message);
        }
    }

    public override webSocketClose(ws: WebSocket, code: number, reason: string): void {
        if (!this.listeners.close(ws, code, reason)) {
            this.broadcasters.close(ws, code, reason);
        }
    }
}
