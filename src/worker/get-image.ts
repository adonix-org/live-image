import { SourceWorker, ImageContext } from "./source-worker";
import { getImageType } from "../utils";
import { ImageResponse } from "../response";
import { GET, Method, Time } from "@adonix.org/cloud-spark";
import { Paths } from "../routes";
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

    protected async process(context: ImageContext): Promise<Response> {
        const image = await context.stub.get();
        const imageType = image && getImageType(image);
        if (imageType) {
            return this.response(ImageResponse, image, imageType, {
                "max-age": Time.Day,
                "s-maxage": Time.Day,
            });
        }

        return this.env.ASSETS.fetch(new URL("/img/offline.jpg", this.request.url));
    }
}
