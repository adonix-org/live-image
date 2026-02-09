import { RouteTable } from "@adonix.org/cloud-spark";
import { DeleteImage } from "./workers/image/delete";
import { GetImage } from "./workers/image/get";
import { SetImage } from "./workers/image/set";
import { Publish } from "./workers/ws/publish";
import { Subscribe } from "./workers/ws/subscribe";

export const Routes: RouteTable = [
    GetImage.ROUTE,
    SetImage.ROUTE,
    DeleteImage.ROUTE,
    Publish.ROUTE,
    Subscribe.ROUTE,
];
