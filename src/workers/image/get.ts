import { SourceWorker, SourceContext } from "../source";
import { ImageResponse } from "../../responses";
import { GET, RouteTuple, Time } from "@adonix.org/cloud-spark";
import { cache } from "@adonix.org/cloud-spark/cache";

export class GetImage extends SourceWorker {
    public static readonly ROUTE: RouteTuple = [GET, "/live/:source", GetImage];

    protected override getRoute(): RouteTuple {
        return GetImage.ROUTE;
    }

    protected override init(): void {
        super.init();
        this.use(cache());
    }

    protected override async respond(context: SourceContext): Promise<Response> {
        const data = await context.stub.get();
        if (data) {
            return this.response(ImageResponse, data, {
                public: true,
                "max-age": Time.Minute,
                "s-maxage": Time.Minute,
            });
        }

        return this.env.ASSETS.fetch(new URL("/img/offline.jpg", this.request.url));
    }
}
