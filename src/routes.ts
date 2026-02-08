import { DELETE, GET, POST, RouteTable } from "@adonix.org/cloud-spark";
import { DeleteImage } from "./workers/image/delete";
import { GetImage } from "./workers/image/get";
import { SetImage } from "./workers/image/set";
import { Publish } from "./workers/ws/publish";
import { Subscribe } from "./workers/ws/subscribe";

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
