import {machinesController} from './machinesController'
import * as Hapi from "@hapi/hapi";
export default function (server:any) {
    //machine routes
    let machines = new machinesController();
     server.route(machines.addMachines());
    server.route(machines.getMachineDetails())
    server.route(machines.updateMachineDetails())
    server.route(machines.removeMachineDetails())
    server.route(machines.countMachine())
    server.route(machines.quantityOfMachines())
    server.route(machines.filterPrice())
    server.route(machines.searchMachine())
   
}