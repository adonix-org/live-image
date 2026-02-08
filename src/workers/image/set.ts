import { getImageType } from "../../utils";
import { SuccessJson } from "../../responses";
import { BadRequest, Method, POST } from "@adonix.org/cloud-spark";
import { AuthImage } from "./auth";
import { ImageContext } from "../source";

export class SetImage extends AuthImage {
    protected get method(): Method {
        return POST;
    }

    protected async process(context: ImageContext): Promise<Response> {
        const image = await this.request.arrayBuffer();
        if (image.byteLength === 0) {
            return this.response(BadRequest, "Missing image.");
        }

        const mediaType = getImageType(image);
        if (!mediaType) {
            return this.response(BadRequest, "Invalid or unsupported image.");
        }

        await context.stub.put(image);
        return this.response(SuccessJson, `${image.byteLength} bytes sourced.`);
    }
}
