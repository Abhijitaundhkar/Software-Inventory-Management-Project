"use strict";
import * as Hapi from "@hapi/hapi";
import route from "./softwareOrder-route";

exports.plugin = {
  name: "softwareOrder plugin",
  version: "1.0.0",
  register: async (server: Hapi.Server, options: any) => {
    try {
      route(server);
      console.log("softwareOrder database plugin register successfully");
    } catch (error) {
      console.log(`Error ocurred while student plugin`);
    }
  },
};