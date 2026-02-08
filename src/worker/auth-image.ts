import { SourceWorker } from "./source-worker";
import { auth } from "../middleware/authorization";
import { Paths } from "../routes";

export abstract class AuthImage extends SourceWorker {
    protected get path(): string {
        return Paths.liveImage;
    }

    protected override init(): void {
        super.init();
        this.use(auth());
    }
}
