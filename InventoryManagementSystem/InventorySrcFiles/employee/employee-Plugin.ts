"use strict";
import * as Hapi from "@hapi/hapi";
import route from "./employee-route";

exports.plugin = {
  name: "employee plugin",
  version: "1.0.0",
  register: async (server: Hapi.Server) => {
    try {
      route(server);
      console.log("employee database plugin register successfully");
    } catch (error) {
      console.log(`Error ocurred while student plugin`);
    }
  },
};