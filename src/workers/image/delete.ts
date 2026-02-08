import { SuccessJson } from "../../responses";
import { DELETE, Method } from "@adonix.org/cloud-spark";
import { AuthImage } from "./auth";
import { ImageContext } from "../source";

export class DeleteImage extends AuthImage {
    protected get method(): Method {
        return DELETE;
    }

    protected async process(context: ImageContext): Promise<Response> {
        await context.stub.delete();
        return this.response(SuccessJson, "Image deleted.");
    }
}
