import {productOrderController} from './productOrderController'
import * as Hapi from "@hapi/hapi";
export default function(server:Hapi.Server){
    let orderProduct=new productOrderController()
    server.route(orderProduct.addProductOrders())
    server.route(orderProduct.getAllProductOrders())
    server.route(orderProduct.updateProductOrders())
    server.route(orderProduct.deleteProductOrders())
    server.route(orderProduct.orderDetailsByEmployee())
    server.route(orderProduct.productOrderById())
    
}