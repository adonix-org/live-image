import { WebSocketConnection, WSAttachment } from "@adonix.org/cloud-spark";
import { WebSocketSessions } from "@adonix.org/cloud-spark/sessions";

interface Subscriber {
    lastAcknowledge: number;
    lastPublish: number;
}

export class Sessions<A extends WSAttachment = WSAttachment> extends WebSocketSessions<A> {
    public broadcast(json: unknown, attachment?: Partial<A>): void {
        for (const session of this) {
            if (attachment) {
                session.attach(attachment);
            }
            try {
                session.send(JSON.stringify(json));
            } catch (error) {
                console.error(error);
                session.close(1011, String(error));
            }
        }
    }
}

export class Subscribers extends Sessions<Subscriber> {
    private static readonly ACK_THRESHOLD = 60_000;

    public override create(): WebSocketConnection<Subscriber> {
        return super.create({ lastAcknowledge: Date.now(), lastPublish: Date.now() });
    }

    /**
     * Returns the number of currently active subscribers.
     *
     * A subscriber is considered active if **either**:
     *   1. They have acknowledged the latest publish (`lastAcknowledge >= lastPublish`), or
     *   2. They have not yet acknowledged, but the publish is still within the
     *      grace period defined by `ACK_THRESHOLD`.
     *
     * This ensures that subscribers are only considered inactive after they
     * have failed to acknowledge a publish for longer than the threshold.
     *
     * @returns The count of subscribers currently considered active.
     */
    public get active(): number {
        let count = 0;
        for (const session of this) {
            const { lastPublish, lastAcknowledge } = session.attachment;
            if (
                lastAcknowledge >= lastPublish ||
                lastPublish - lastAcknowledge < Subscribers.ACK_THRESHOLD
            ) {
                count++;
            }
        }
        return count;
    }

    public publish(): void {
        const now = Date.now();
        this.broadcast({ event: "publish", id: now }, { lastPublish: now });
    }

    public acknowledge(ws: WebSocket): void {
        const subscriber = this.get(ws);
        if (subscriber) {
            subscriber.attach({ lastAcknowledge: Date.now() });
        }
    }
}

export class Publishers extends Sessions {
    public online(subscribers: Subscribers): void {
        const size = subscribers.size;
        const active = subscribers.active;
        const zombies = size - active;
        this.broadcast({
            event: "online",
            active,
            zombies,
            subscribers: size,
            publishers: this.size,
        });
    }
}
