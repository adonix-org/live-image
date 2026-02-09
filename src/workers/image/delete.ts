import { DELETE, RouteTuple } from "@adonix.org/cloud-spark";

import { SuccessJson } from "../../responses";
import { SourceContext, SourceWorker } from "../source";

export class DeleteImage extends SourceWorker {
    public static readonly ROUTE: RouteTuple = [DELETE, "/live/:source", this];

    protected override async respond(context: SourceContext): Promise<Response> {
        await context.stub.delete();
        return this.response(SuccessJson, "Image deleted.");
    }
}
