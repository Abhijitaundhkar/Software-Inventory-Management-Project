import { Sequelize } from "sequelize";
import * as Glue from "@hapi/glue";
import * as Inert from "@hapi/inert";
import * as HapiSwagger from "hapi-swagger";
export const sequelize = new Sequelize("InventoryManagementDatabase", "postgres", "admin", {
host: "localhost",
dialect: "postgres",
});

const manifest = {
    server: {
      host: "localhost",
      port: 8005,
     
    },
    register: {
      plugins: [
        Inert,
        require("@hapi/vision"),
       //administrator plugin
      {
        plugin: require("./administrator/administrator-Plugin.js"),
        routes: { prefix : "/Administrator" }

      },
      //employee plugin
      {
        plugin: require("./employee/employee-Plugin.js"),
        routes: { prefix : "/employee" }

      },
      //machine-plugin
      {
        plugin: require("./machines/machine-plugin.js"),
        routes: { prefix : "/machines" }

      },
      //machineOrder-Plugin
      {
        plugin: require("./machineOrders/machineOrder-Plugin.js"),
        routes: { prefix : "/machineOrders" }

      },
      //softwares-plugin
      {
        plugin: require("./softwares/softwares-plugin.js"),
        routes: { prefix : "/softwares" }

      },
    //  softwareOrders-plugin
      {
        plugin: require("./softwareOrder/softwareOrders-plugin.js"),
        routes: { prefix : "/softwareOrder" }

      },
      //swagger-plugin
        {
          plugin: HapiSwagger,
          options: {
            info: {
              title: "Test API Documentation",
              version: "1.0.0",
            },
          },
        },
        {
          plugin: require("hapi-sequelizejs"),
          options: [
            {
              name: "InventoryManagementDatabase", // identifier database
              models: [__dirname + "/InventoryDatabaseTables/**/*.js"], // paths/globs to model files
              // ignoredModels: [__dirname + "/models/**/*.js"], // OPTIONAL: paths/globs to ignore files
              
              sequelize, // sequelize instance
              sync: true, // sync models - default false
               
              forceSync:false, // force sync (drops tables) - default false
            },
          ],
        },
       
      ],
    },
  };
  

  const options = {
    relativeTo: __dirname,//base dir name
  };
  console.log(__dirname)
  const startServer = async function () {
    try {
      const server = await Glue.compose(manifest, options);
      //check  database connection
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
      await server.start();
      
      console.log("hapi days!" + server.info.uri);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  
  startServer();
  









