import {machineOrderController} from './machineOrderController'
import * as Hapi from "@hapi/hapi";

export default function(server:Hapi.Server){

let order = new machineOrderController();
server.route(order.addMachineOrders());
 server.route(order.getOrderDetails());
 server.route(order.updateMachineOrders());
 server.route(order.deleteOrder())
 server.route(order.OrderDetailsById())
}