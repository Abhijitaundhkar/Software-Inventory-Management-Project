import {SoftwareOrderController} from './softwareOrderController'
import * as Hapi from "@hapi/hapi";
export default function(server:Hapi.Server){
    let orderSoftware=new SoftwareOrderController()
    server.route(orderSoftware.addSoftwareOrders())
    server.route(orderSoftware.getSoftwareOrders())
    server.route(orderSoftware.updateSoftwareOrders())
    server.route(orderSoftware.deleteSoftwareOrders())
    server.route(orderSoftware.softwareOrderById())
    server.route(orderSoftware.orderDetailsByEmployee())
}