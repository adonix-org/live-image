import { DELETE, GET, POST, RouteTable } from "@adonix.org/cloud-spark";
import { DeleteImage } from "./worker/image/delete";
import { GetImage } from "./worker/image/get";
import { SetImage } from "./worker/image/set";
import { Publish } from "./worker/ws/publish";
import { Subscribe } from "./worker/ws/subscribe";

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
