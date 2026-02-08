import { Time, WebSocketConnection, WSAttachment } from "@adonix.org/cloud-spark";
import { WebSocketSessions } from "@adonix.org/cloud-spark/sessions";

interface Subscriber {
    lastAcknowledge: number;
    lastPublish: number;
}

class Sessions<A extends WSAttachment = WSAttachment> extends WebSocketSessions<A> {
    public notify(json: unknown, attachment?: Partial<A>): void {
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
     * A subscriber is considered active if:
     *  1. They have acknowledged the latest publish (`lastAcknowledge >= lastPublish`), or
     *  2. They have not yet acknowledged, but are still within the grace period
     *     defined by `ACK_THRESHOLD` since the last publish.
     *
     * This ensures that subscribers are only counted as inactive after the grace
     * period has elapsed following a publish, giving them time to respond.
     *
     * @returns The count of subscribers who are currently active.
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
        this.notify({ event: "publish" }, { lastPublish: Date.now() });
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
        this.notify({ event: "online", active, zombies, subscribers: size, publishers: this.size });
    }
}
