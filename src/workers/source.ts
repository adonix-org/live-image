import { Method, NotFound, PathParams, RouteWorker } from "@adonix.org/cloud-spark";
import { ImageStore } from "../durables/store";

export interface ImageContext {
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
    protected abstract process(context: ImageContext): Promise<Response>;
    protected abstract get path(): string;
    protected abstract get method(): Method;

    public override getAllowedMethods(): Method[] {
        return [this.method];
    }

    protected override init(): void {
        this.route(this.method, this.path, this.handler);
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

        return this.process({ sourceId, stub, params });
    }
}
