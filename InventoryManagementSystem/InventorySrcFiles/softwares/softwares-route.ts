import {softwareController} from './softwareController'

export default function(server:any){
let software = new softwareController();
    server.route(software.addNewSoftware());
    server.route(software.getAllSoftwareDetails())
    server.route(software.updateSoftwareDetails())
    server.route(software.deleteSoftwareDetails())
    server.route(software.countAllSoftwares())
    server.route(software.checkQuantityOfSoftware())
    server.route(software.filterSoftwarePrice())
    server.route(software.searchSoftwares())

}