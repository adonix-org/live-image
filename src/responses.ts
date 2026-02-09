import {
    CacheControl,
    HttpError,
    JsonResponse,
    StatusCodes,
    WorkerResponse,
} from "@adonix.org/cloud-spark";
import { ImageData } from "./durables/store";

export class ImageResponse extends WorkerResponse {
    constructor(data: ImageData, cache?: CacheControl) {
        super(data.image, cache);
        this.setHeader("Content-Type", data.mediaType);
        this.setHeader("LiveImage-Id", String(data.id));
        this.setHeader("X-Content-Type-Options", "nosniff");
    }
}

export class SuccessJson extends JsonResponse {
    constructor(message: string, cache?: CacheControl, status = StatusCodes.OK) {
        super({ status, message }, cache, status);
    }
}

export class UnsupportedMediaType extends HttpError {
    constructor(details?: string) {
        super(StatusCodes.UNSUPPORTED_MEDIA_TYPE, details);
    }
}
