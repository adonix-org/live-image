import { Middleware, Unauthorized, Worker } from "@adonix.org/cloud-spark";

class Authorization implements Middleware {
    handle(worker: Worker, next: () => Promise<Response>): Promise<Response> {
        const auth = worker.request.headers.get("Authorization");
        if (!auth || auth !== `Bearer ${worker.env.LIVEIMAGE_ADMIN_KEY}`) {
            return new Unauthorized().response();
        }
        return next();
    }
}

export function auth(): Middleware {
    return new Authorization();
}
