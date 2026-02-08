import { LiveImage } from "./workers/live";

export { ImageStore } from "./durables/store";

export default LiveImage.ignite();
