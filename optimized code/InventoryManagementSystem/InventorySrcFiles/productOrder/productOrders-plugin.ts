"use strict";
import * as Hapi from "@hapi/hapi";
import route from "./productOrder-route";

exports.plugin = {
  name: "productOrder plugin",
  version: "1.0.0",
  register: async (server: Hapi.Server, options: any) => {
    try {
      route(server);
      console.log("productOrder database plugin register successfully");
    } catch (error) {
      console.log(`Error ocurred while student plugin`);
    }
  },
};