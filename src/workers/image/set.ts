import { SuccessJson, UnsupportedMediaType } from "../../responses";
import { BadRequest, Method, POST } from "@adonix.org/cloud-spark";
import { AuthImage } from "./auth";
import { SourceContext } from "../source";

export class SetImage extends AuthImage {
    protected get method(): Method {
        return POST;
    }

    protected async process(context: SourceContext): Promise<Response> {
        const image = await this.request.arrayBuffer();
        if (image.byteLength === 0) {
            return this.response(BadRequest, "Missing image.");
        }

        const mediaType = this.request.headers.get("Content-Type");
        if (!mediaType) {
            return this.response(UnsupportedMediaType, "Missing Content-Type header.");
        }
        if (!mediaType.startsWith("image/")) {
            return this.response(UnsupportedMediaType, mediaType);
        }

        await context.stub.put(image, mediaType);
        return this.response(SuccessJson, `${image.byteLength} bytes stored.`);
    }
}
