import { auth } from "../../middleware/auth";
import { SourceWorker } from "../source";

export abstract class AuthWorker extends SourceWorker {
    protected override init(): void {
        super.init();
        this.use(auth());
    }
}
