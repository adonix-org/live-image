import { SourceWorker, SourceContext } from "../source";
import { ImageResponse } from "../../responses";
import { GET, Method, Time } from "@adonix.org/cloud-spark";
import { Paths } from "../../routes";
import { cache } from "@adonix.org/cloud-spark/cache";

export class GetImage extends SourceWorker {
    protected get method(): Method {
        return GET;
    }

    protected get path(): string {
        return Paths.liveImage;
    }

    protected override init(): void {
        super.init();
        this.use(cache());
    }

    protected async process(context: SourceContext): Promise<Response> {
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
