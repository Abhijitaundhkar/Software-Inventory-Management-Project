import * as Hapi from "@hapi/hapi";
import {employeeController} from './employeeController'

export default function (server:Hapi.Server) {
    
    //employee routes
    let employee = new employeeController();
    server.route(employee.addNewEmployee());
    server.route(employee.getAllEmployeeDetails())
    server.route(employee.updateEmployeeDetails())
    server.route(employee.deleteEmployeeDetails())
    server.route(employee.loginEmployee())
    server.route(employee.employeeForgotPassword())
    //server.route(employee.addEmployee2())


}