import { DELETE, GET, POST, RouteTable } from "@adonix.org/cloud-spark";
import { DeleteImage } from "./live/delete-image";
import { GetImage } from "./live/get-image";
import { SetImage } from "./live/set-image";
import { Publish } from "./websocket/publish";
import { Subscribe } from "./websocket/subscribe";

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
