"use strict";
import * as Hapi from "@hapi/hapi";
import route from "./administrator-route";

exports.plugin = {
  name: "administrator plugin",
  version: "1.0.0",
  register: async (server: Hapi.Server, options: any) => {
    try {
      route(server);
      console.log("administrator database plugin register successfully");
    } catch (error) {
      console.log(`Error ocurred while student plugin`);
    }
  },
};