import { GET, RouteTuple, Time } from "@adonix.org/cloud-spark";

import { ImageResponse } from "../../responses";
import { SourceContext, SourceWorker } from "../source";

const Cache = {
    STABLE: {
        public: true,
        "max-age": Time.Week,
        "s-maxage": Time.Week,
        immutable: true,
    },
    LIVE: {
        public: true,
        "max-age": 30 * Time.Second,
        "s-maxage": 30 * Time.Second,
    },
} as const;

export class GetImage extends SourceWorker {
    public static readonly ROUTE: RouteTuple = [GET, "/live/:source{/:id}", this];

    protected override async respond(context: SourceContext): Promise<Response> {
        const data = await context.stub.get();
        if (!data) {
            return this.env.ASSETS.fetch(new URL("/img/offline.jpg", this.request.url));
        }

        const cache = context.params["id"] ? Cache.STABLE : Cache.LIVE;
        return this.response(ImageResponse, data, cache);
    }
}
