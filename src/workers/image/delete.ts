import { DELETE, RouteTuple } from "@adonix.org/cloud-spark";

import { SuccessJson } from "../../responses";
import { SourceContext } from "../source";

import { AuthWorker } from "./auth";

export class DeleteImage extends AuthWorker {
    public static override readonly ROUTE: RouteTuple = [DELETE, "/live/:source", this];

    protected override async respond(context: SourceContext): Promise<Response> {
        await context.stub.delete();
        return this.response(SuccessJson, "Image deleted.");
    }
}
