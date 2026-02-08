import { LiveImage } from "./workers/image/live";

export { ImageStore } from "./durables/store";

export default LiveImage.ignite();
