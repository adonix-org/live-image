import { Middleware, Unauthorized, Worker } from "@adonix.org/cloud-spark";

class Authorization implements Middleware {
    handle(worker: Worker, next: () => Promise<Response>): Promise<Response> {
        const auth = worker.request.headers.get("Authorization");
        if (auth === `Bearer ${worker.env.LIVEIMAGE_ADMIN_KEY}`) {
            return next();
        }

        return new Unauthorized().response();
    }
}

export function auth(): Middleware {
    return new Authorization();
}
