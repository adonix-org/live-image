import { RouteTable } from "@adonix.org/cloud-spark";

import { DeleteImage } from "./workers/image/delete";
import { GetImage } from "./workers/image/get";
import { SetImage } from "./workers/image/set";
import { Broadcast, Listen } from "./workers/stream";
import { Publisher } from "./workers/ws/publisher";
import { Subscriber } from "./workers/ws/subscriber";

export const Routes: RouteTable = [
    GetImage.ROUTE,
    SetImage.ROUTE,
    DeleteImage.ROUTE,
    Publisher.ROUTE,
    Subscriber.ROUTE,
    Broadcast.ROUTE,
    Listen.ROUTE,
];
