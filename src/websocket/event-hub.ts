import { Publishers, Subscribers } from "./sessions";

export class EventHub {
    private static readonly SUBSCRIBE = "subscribe";
    private static readonly PUBLISH = "publish";

    private readonly subscribers = new Subscribers();
    private readonly publishers = new Publishers();
}
