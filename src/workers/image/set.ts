import { BadRequest, POST, RouteTuple } from "@adonix.org/cloud-spark";

import { SuccessJson, UnsupportedMediaType } from "../../responses";
import { SourceContext } from "../source";

import { AuthWorker } from "./auth";

export class SetImage extends AuthWorker {
    public static override readonly ROUTE: RouteTuple = [POST, "/live/:source", this];

    protected async respond(context: SourceContext): Promise<Response> {
        const image = await this.request.arrayBuffer();
        if (image.byteLength === 0) {
            return this.response(BadRequest, "Missing image.");
        }

        const mediaType = this.request.headers.get("Content-Type");
        if (!mediaType) {
            return this.response(UnsupportedMediaType, "Missing Content-Type header.");
        }
        if (!mediaType.toLowerCase().startsWith("image/")) {
            return this.response(UnsupportedMediaType, mediaType);
        }

        await context.stub.put(image, mediaType);
        return this.response(SuccessJson, `${image.byteLength} bytes stored.`);
    }
}
