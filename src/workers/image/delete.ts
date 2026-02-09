import { SuccessJson } from "../../responses";
import { DELETE, RouteTuple } from "@adonix.org/cloud-spark";
import { SourceContext, SourceWorker } from "../source";

export class DeleteImage extends SourceWorker {
    public static readonly ROUTE: RouteTuple = [DELETE, "/live/:source", DeleteImage];

    protected override getRoute(): RouteTuple {
        return DeleteImage.ROUTE;
    }

    protected override async respond(context: SourceContext): Promise<Response> {
        await context.stub.delete();
        return this.response(SuccessJson, "Image deleted.");
    }
}
