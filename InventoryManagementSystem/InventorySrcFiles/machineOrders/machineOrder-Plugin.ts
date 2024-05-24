"use strict";
import * as Hapi from "@hapi/hapi";
import route from "./machineOrder-route";

exports.plugin = {
  name: "machineOrder plugin",
  version: "1.0.0",
  register: async (server: Hapi.Server) => {
    try {
      route(server);
      console.log("machineOrder database plugin register successfully");
    } catch (error) {
      console.log(`Error ocurred while student plugin`);
    }
  },
};