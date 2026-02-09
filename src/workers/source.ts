import { Method, NotFound, PathParams, RouteTuple, RouteWorker } from "@adonix.org/cloud-spark";

import { ImageStore } from "../durables/store";

export interface SourceContext {
    sourceId: string;
    stub: DurableObjectStub<ImageStore>;
    params: PathParams;
}

interface Source {
    id: string;
    type: string;
    path: string;
    description: string;
}

interface SourcesConfig {
    sources: Source[];
}

export abstract class SourceWorker extends RouteWorker {
    protected abstract respond(context: SourceContext): Promise<Response>;
    protected static readonly ROUTE: RouteTuple;

    protected getRoute(): RouteTuple {
        const ctor = this.constructor as typeof SourceWorker & { name: string };
        const route = ctor.ROUTE;
        if (!route) {
            throw new Error(`${ctor.name} must define static ROUTE`);
        }
        return route;
    }

    public override getAllowedMethods(): Method[] {
        return [this.getRoute()[0]];
    }

    protected override init(): void {
        const route = this.getRoute();
        this.route(route[0], route[1], this.handler);
    }

    private async handler(params: PathParams): Promise<Response> {
        const sourceId = params["source"];
        if (!sourceId) {
            return this.response(NotFound, "Missing source.");
        }

        const response = await this.env.ASSETS.fetch(new URL("/sources.json", this.request.url));
        if (!response.ok) {
            return this.response(NotFound, "Missing sources.json config file.");
        }

        const json = (await response.json()) as SourcesConfig;
        const allowed = json.sources.some((s) => s.id === sourceId);
        if (!allowed) {
            return this.response(NotFound, "Invalid source.");
        }
        const stub = this.env.IMAGE_STORE.getByName(sourceId);

        return this.respond({ sourceId, stub, params });
    }
}
