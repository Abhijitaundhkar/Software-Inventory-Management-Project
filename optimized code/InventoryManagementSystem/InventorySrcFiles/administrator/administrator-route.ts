import * as Hapi from "@hapi/hapi";
import {administratorController} from "./administratorController"

export default function (server:Hapi.Server) {

    //administrator routes
    let administrator = new administratorController();
    server.route(administrator.addNewAdministrator());
    server.route(administrator.getAllAdministratorDetails());
    server.route(administrator.updateAdministratorDetails());
    server.route(administrator.deleteAdministratorDetails());
    server.route(administrator.loginAdministrator());
    server.route(administrator.AdministratorForgotPassword());

}
  











