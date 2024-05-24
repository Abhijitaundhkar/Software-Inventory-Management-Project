import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";
import { Sequelize ,Op} from "sequelize";
import  fs from 'fs'

export class machinesController{
  public addMachines(){
    return{
      method: "POST",
      path: "/addMachines",
      handler: async function (request: any, h: Hapi.ResponseToolkit) {
        try {
            //get the database
          const dataBase = request.getDb("InventoryManagementDatabase");
          const machineTableData = dataBase.models.machines;
          const {imagePath} =request.payload;

          let fileType = imagePath.hapi.filename;
          const machineName=await machineTableData.findOne({where:{Name:request.payload.Name}})
          if(machineName)
          { 
            return 'machine already present '
          }
          else{
          //check image type 
           if(fileType.match(/\.(jpg|jpeg|png|gif)$/))
            {
              try{
                  //check image present or not
                      if (fs.existsSync(`./upload/${fileType}`)) 
                      {
                        return h.response({ message: "image already present" });
                        }
                        else{
                           //add to image on that folder
                          fs.writeFile(`./upload/${fileType}`, imagePath._data, (err) => {
                            if(err)
                            {
                              console.log(err)
                            } 
                          })
                     //add machines
                       machineTableData.create({
                        Name: request.payload.Name,
                        description:request.payload.description,
                        price:request.payload.price,
                        quantity:request.payload.quantity,
                        imagePath: `./upload/${imagePath.hapi.filename}`,
                    
                      });
                      return h.response('machine added')
                 }
              }
          catch(err){
            console.log(err)
          }
        }
          else{
            return 'file type not found'
          }
        }
      }
      
         catch (error) {
          console.log(error);
        }
      },
      options: {
        plugins: {
          "hapi-swagger": {
            payloadType: "form",
          },
        },
         auth: false,
         validate: {
          payload: Joi.object({
            Name:Joi.string().default('machine name'),
            description:Joi.string().required(),
            price:Joi.number().min(0).required(),
            quantity:Joi.number().min(0).required(),
            imagePath: Joi.any().meta({ swaggerType: "file" }).required(),
          
        
          }),
        },
        payload: {
          maxBytes: 1048576000,
          parse: true,
          output: "stream",
          allow: ["multipart/form-data"],
          multipart: true,
        },

       description: "Add machines ",
       notes: "Returns a todo item by the id passed in the path",
       tags: ["api"], // ADD THIS TAG
     },
   };
 }
       
         public getMachineDetails() 
         {
          return {
            method: "GET",
            path: "/getMachineDetails",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("InventoryManagementDatabase");
                const machineTableData = dataBase.models.machines;
                //get machine data ascending order
                const result=await machineTableData.findAll({                    
                  order:[
                    ['machineId','ASC']
                  ]
                 })  
               //data present 1 or more
                if (result.length>=1) {
                     return JSON.stringify(result, null, 2);
                   } else 
                   {
                    return h.response({ message: "no products available"})
                   }
              } catch (err) {
                console.log(err);
              }
            },
            options: {
            
              description: "Find machines",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public updateMachineDetails() {
          return {
            method: "PUT",
            path:"/updateMachineDetails/{machineId}",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                      const dataBase = await request.getDb("InventoryManagementDatabase");
                      const machineTableData = dataBase.models.machines;
                      const searchId = request.params.machineId;
                      const { imagePath} =request.payload;
                      const result = await machineTableData.findOne({
                        where: { machineId: searchId } ,
                      });
                          if(result)
                          {
                            try{
                              //delete  current machine image from folder current machine 
                              fs.unlink(`${result.imagePath}`,(err)=>{
                              if(err){
                                console.log(err)
                              }
                                });
                                let fileType = imagePath.hapi.filename;
                                //check image extension
                                  if(fileType.match(/\.(jpg|jpeg|png|gif)$/))
                                  {
                                    //file is present or not
                                    if ( fs.existsSync(`./upload/${fileType}`)) 
                                    {
                                      return h.response({ message: "image already present" });
                                    }
                                  else{
                                    //add image on that file
                                        fs.writeFile(`./upload/${fileType}`, imagePath._data, (err:any) => {
                                        })
                                        if (result) 
                                        {
                                          result.Name=request.payload.Name,
                                          result.description=request.payload.description,
                                          result.price=request.payload.price,
                                          result.quantity=request.payload.quantity,
                                          result.imagePath=`./upload/${imagePath.hapi.filename}`
                                          await result.save();
                                          return JSON.stringify(result, null, 2);
                                        }
                                        else {
                                          return "false";
                                        }
                                      }
                          }
                          else{
                            return 'image file type not found'
                          }
              
                            }
                              catch(err){
                                console.log(err);
                              }
                }else{
                  return 'no machine id available'
                }
          }
             catch (error) {
              console.log(error);
            }
            },
          options: {
            plugins: {
              "hapi-swagger": {
                payloadType: "form",
              },
            },
              auth: false,
              validate: {
                params: Joi.object({
                  machineId: Joi.string(),
                }),
                payload: Joi.object({
                  Name: Joi.string(),
                  description:Joi.string(),
                  price:Joi.number().min(0).required(),
                  quantity:Joi.number().min(0).required(),
                   imagePath: Joi.any().meta({ swaggerType: "file" }),
                  }),
                },
                payload: {
                  maxBytes: 1048576000,
                  parse: true,
                  output: "stream",
                  allow: ["multipart/form-data"],
                  multipart: true,
                
              },
              description: "Update machines",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
      
        removeMachineDetails() {
          return {
            method: "DELETE",
            path:"/removeMachineDetails/{machineId}",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              // try {
                const dataBase = await request.getDb("InventoryManagementDatabase");
                const machineTableData = dataBase.models.machines;
              const searchId = request.params.machineId;
              //check machine id present or not
              const image=await machineTableData.findOne({  
                where:{machineId:searchId}
              })
              //if present than delete 
              const result=await machineTableData.destroy({
                where:{machineId:searchId}
              })
              if(result){
                try{  
                  //delete image from folder
                fs.unlink(`${image.imagePath}`,(err)=>{
                    if(err){
                      console.log(err)
                    }
                });
                return 'deleted'
                 }
                 catch(err){
                  console.log(err);
                 }
              }
          else{
            return 'not found machine id'
          }
          
            },
            options: {
              validate: {
                params: Joi.object({
                  
                  machineId:Joi.number()
                }),
              },
              description: "Delete machines",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public countMachine(){
          return{
              method: "GET",
             path: "/countMachine",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const machineTableData = dataBase.models.machines;
                //find total machines present
                const result = await machineTableData.findAll({
                attributes: [[Sequelize.fn('count', Sequelize.col('machineId')),'totalCount']],
                });
                if(result){
                  return JSON.stringify(result,null,2)
                }else{
                  return 'no data available';
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              description: "count machine",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }     

        public quantityOfMachines(){
          return{
              method: "GET",
             path: "/quantityOfMachines/{machineId}",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const machineTableData = dataBase.models.machines;
                const {machineId} =request.params;
               //quantity of machines find
                const result = await machineTableData.findAll({
                attributes: ['quantity'],
                where:{
                  machineId:machineId
             }, 
      
                });
                if(result.length>=1){

                  return JSON.stringify(result,null,2)
                }else{
                  return false;
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              validate: {
                params: Joi.object({
                  machineId: Joi.number(),
                  
                }),
              },
             
              description: "quantityOfMachines",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }  
        
        
        public filterPrice(){
          return{
              method: "GET",
             path: "/filterPrice",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const machineTableData = dataBase.models.machines;
                //filter price low to high
                const result = await machineTableData.findAll({ 
                attributes: ['Name','quantity',[Sequelize.fn('sum', Sequelize.col('price')),'price']],
                 
                  group : ['machineId'],
                  order:[['price','ASC']]

                });
                if(result){
                  return h.response({
                    msg: 'filter result',
                    product:result
                  })
                }else{
                  return false;
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
           
             
              description: "filter price low to high",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }     
        public searchMachine(){
          return{
              method: "GET",
             path: "/searchMachine/{Name}",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.machines;
               //search the name of machine
                const result = await getTableData.findAll({
                  where: {
                    Name: {
                      [Op.like]: request.params.Name +'%' 
                    }
                    },
                    order:[
                      [
                      'Name', 'ASC']
                    ]
                  })
               
                if(result.length>=1){
                  return h.response({
                    msg: 'search result',
                    product:result
                  })
                }else{
                  return 'sorry not found';
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              validate: {
                params: Joi.object({
                Name: Joi.string()
                  
                }),
              },
             
              description: "filter machines",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
      }
        






      //   public addMachines(){
      //     return{
      //       method: "POST",
      //       path: "/addMachines",
      //       handler: async function (request: any, h: Hapi.ResponseToolkit) {
      //         try {
            
      
      //           const dataBase = request.getDb("InventoryManagementDatabase");
      //           
      //           const machineTableData = dataBase.models.machines;
      //           const { imagePath} =request.payload;
      //           console.log(imagePath)
                  
      //           let fileType = imagePath.hapi.filename;
      //           console.log(fileType)
      //             if(fileType.match(/\.(jpg|jpeg|png|gif)$/))
      //             {
      //               try{
      //                       if (await fs.existsSync(`./upload/${fileType}`)) 
      //                       {
      //                         return h.response({ message: "image already present" });
      //                         }
      //                         else{
      //                           fs.writeFile(`./upload/${fileType}`, imagePath._data, (err:any) => {
      //                           })
      //                       console.log('joooo')
                          
      //                       const result = machineTableData.create({
      //                         Name: request.payload.Name,
      //                         description:request.payload.description,
      //                         price:request.payload.price,
      //                         quantity:request.payload.quantity,
      //                       imagePath: `./upload/${imagePath.hapi.filename}`,
                          
      //                       });
      //                       return 'machine added'
      //                  }
      //               }
      //           catch(err){
      //             console.log(err)
      //           }
      //         }
      //           else{
      //             return 'file type not found'
      //           }
        
      //         } catch (error) {
      //           console.log(error);
      //         }
      //       },
      //       options: {
      //         plugins: {
      //           "hapi-swagger": {
      //             payloadType: "form",
      //           },
      //         },
      //          auth: false,
      //         validate: {
      //           payload: Joi.object({
      //             Name:Joi.string().default('machine name'),
      //             description:Joi.string(),
      //             price:Joi.number().required(),
      //             quantity:Joi.number().required(),
      //             imagePath: Joi.any().meta({ swaggerType: "file" }).required(),
                
              
      //           }),
      //         },
      //         payload: {
      //           maxBytes: 1048576000,
      //           parse: true,
      //           output: "stream",
      //           allow: ["multipart/form-data"],
      //          multipart: true,
      //         },
    
      //        description: "Add machines",
      //        notes: "Returns a todo item by the id passed in the path",
      //        tags: ["api"], // ADD THIS TAG
      //      },
      //    };
      //  }



      //   public image(){
      //     return{
      //       method: "POST",
      //       path: "/,
      //       handler: async function (request: any, h: Hapi.ResponseToolkit) {
      //         try {
            
      //           const dataBase = request.getDb("InventoryManagementDatabase");
      //           //console.log(dataBase)
      //           const machineTableData = dataBase.models.machines;
      //           const { imagePath} =request.payload;
      //           console.log(imagePath)
                  
      //           let fileType = imagePath.hapi.filename;
      //           console.log(fileType)
      //             if(fileType.match(/\.(jpg|jpeg|png|gif)$/))
      //             {
      //               try{
      //               if (await fs.existsSync(`./upload/${fileType}`)) 
      //               {
      //                 return h.response({ message: "image already present" });
      //                 }
      //                 else{
      //                   fs.writeFile(`./upload/${fileType}`, imagePath._data, (err:any) => {
      //                   }
      //                   )
      //               console.log('joooo')
      //               const result = machineTableData.create({
      //                 Name: request.payload.Name,
      //                 description:request.payload.description,
      //                 price:request.payload.price,
      //                  quantity:request.payload.quantity,
      //                imagePath: `./upload/${imagePath.hapi.filename}`,
                  
      //               });
      //               console.log('nfnf',result)
      //               if(result)
      //               return JSON.stringify(result,null,);
      //             }
      //           }
              
                  
      //           catch(err){
      //             console.log(err)
      //           }
      //         }
      //           else{
      //             return 'file type not found'
      //           }
        
      //         } catch (error) {
      //           console.log(error);
      //         }
      //       },
      //       options: {
      //         plugins: {
      //           "hapi-swagger": {
      //             payloadType: "form",
      //           },
      //         },
      //          auth: false,
      //         validate: {
      //           payload: Joi.object({
      //             Name:Joi.string().default('machine name'),
      //             description:Joi.string(),
      //             price:Joi.string().required(),
      //             quantity:Joi.string().required(),
      //             imagePath: Joi.any().meta({ swaggerType: "file" }),
                
              
      //           }),
      //         },
      //         payload: {
      //           maxBytes: 1048576000,
      //           parse: true,
      //           output: "stream",
      //           allow: ["multipart/form-data"],
      //          multipart: true,
      //         },
    
      //        description: "Add machines",
      //        notes: "Returns a todo item by the id passed in the path",
      //        tags: ["api"], // ADD THIS TAG
      //      },
      //    };
      //  }

      
    
