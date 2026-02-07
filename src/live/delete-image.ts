import { SuccessJson } from "../response";
import { DELETE, Method } from "@adonix.org/cloud-spark";
import { AuthImage } from "./auth-image";
import { ImageContext } from "../source-worker";

export class DeleteImage extends AuthImage {
    protected get method(): Method {
        return DELETE;
    }

    protected async process(context: ImageContext): Promise<Response> {
        await context.stub.delete();
        return this.response(SuccessJson, "Image deleted.");
    }
}
