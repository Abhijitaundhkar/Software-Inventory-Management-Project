"use strict";
import * as Hapi from "@hapi/hapi";
import route from "./product-route";

exports.plugin = {
  name: "product plugin",
  version: "1.0.0",
  register: async (server: Hapi.Server, options: any) => {
    try {
     // console.log(exports.plugin)
      route(server);
      console.log("product database plugin register successfully");
    } catch (error) {
      console.log(`Error ocurred while student plugin`);
    }
  },
};