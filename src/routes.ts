import { DELETE, GET, POST, RouteTable } from "@adonix.org/cloud-spark";
import { DeleteImage } from "./worker/delete-image";
import { GetImage } from "./worker/get-image";
import { SetImage } from "./worker/set-image";
import { Publish } from "./worker/publish";
import { Subscribe } from "./worker/subscribe";

export const Paths = {
    liveImage: "/live/:source",
    subscribe: "/subscribe/:source",
    publish: "/publish/:source",
} as const;

export const Routes: RouteTable = [
    [GET, Paths.liveImage, GetImage],
    [POST, Paths.liveImage, SetImage],
    [DELETE, Paths.liveImage, DeleteImage],

    [GET, Paths.subscribe, Subscribe],
    [GET, Paths.publish, Publish],
];
