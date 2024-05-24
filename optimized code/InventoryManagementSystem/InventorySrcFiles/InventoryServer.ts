import { Sequelize } from "sequelize";
import * as Glue from "@hapi/glue";
import * as Inert from "@hapi/inert";
import * as HapiSwagger from "hapi-swagger";
export const sequelize = new Sequelize("softwareMachineDatabase", "postgres", "rtadmin", {
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
      //product-plugin
      {
        plugin: require("./products/product-plugin.js"),
        routes: { prefix : "/products" }

      },
    // Orders-plugin
      {
        plugin: require("./productOrder/productOrders-plugin.js"),
        routes: { prefix : "/productOrder" }

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
              name: "softwareMachineDatabase", // identifier database
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
  









