import { CacheControl, JsonResponse, StatusCodes, WorkerResponse } from "@adonix.org/cloud-spark";

export class ImageResponse extends WorkerResponse {
    constructor(image: ArrayBuffer, type: string, cache?: CacheControl) {
        super(image, cache);
        this.setHeader("Content-Type", type);
        this.setHeader("X-Content-Type-Options", "nosniff");
    }
}

export class SuccessJson extends JsonResponse {
    constructor(message: string, cache?: CacheControl, status = StatusCodes.OK) {
        super({ status, message }, cache, status);
    }
}
