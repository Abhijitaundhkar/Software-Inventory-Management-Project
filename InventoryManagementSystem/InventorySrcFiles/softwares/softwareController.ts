import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";
import { Sequelize ,Op} from "sequelize";
import * as fs from 'fs'
export class softwareController{
  
        public addNewSoftware(){
            return{
              method: "POST",
              path: "/addNewSoftware",
              handler: async function (request: any, h: Hapi.ResponseToolkit) {
                try {
                  const dataBase = request.getDb("InventoryManagementDatabase");
                  const getTableData = dataBase.models.softwares;
                  const { imagePath} =request.payload;
                  //find machine name already present or not
                  const softwareName=await getTableData.findOne({where:{Name:request.payload.Name}})

                  if(softwareName)
                  { 
                    return 'software already present '
                  }
                  else{
                    let fileType = imagePath.hapi.filename;
                    //check image type 
                    if(fileType.match(/\.(jpg|jpeg|png|gif)$/))
                    {
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
                        getTableData.create({
                          Name: request.payload.Name,
                          description:request.payload.description,
                          price:request.payload.price,
                         quantity:request.payload.quantity,
                         imagePath: `./upload/${imagePath.hapi.filename}`,
                          
                        });
                      
                        return h.response('software added');
          
                    }
                  }
                    else{
                      return  h.response('image file type not found')
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
                    Name:Joi.string().default('software name'),
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
      
               description: "Add software",
               notes: "Returns a todo item by the id passed in the path",
               tags: ["api"], // ADD THIS TAG
             },
           };
         }
         public getAllSoftwareDetails() {
          return {
            method: "GET",
            path: "/getAllSoftwareDetails",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.softwares;
               // get software details ascending order
                const result=await getTableData.findAll({                    
                  order:[[
                    'softwareId','ASC']]
                 })  
              //data present 1 or more
                if (result.length>=1) 
                {
                  return JSON.stringify(result, null, 2);
                } else
                 {
                  return h.response({ message: "no products available"});
                }
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              description: "Find software",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public updateSoftwareDetails() {
          return {
            method: "PUT",
            path: "/updateSoftwareDetails/{softwareId}",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.softwares;
              const searchId = request.params.softwareId;
              const { imagePath} =request.payload;
              //find id present or not
              const result = await getTableData.findOne({
                where: { softwareId: searchId } ,
              });
                  if(result)//true
                  {
                    try{
                      //delete image from folder
                     fs.unlink(`${result.imagePath}`,(err)=>{
                      if(err){
                        console.log(err)
                      }
                        });
                        let fileType = imagePath.hapi.filename;
                        //check file type is image or not
                          if(fileType.match(/\.(jpg|jpeg|png|gif)$/))
                          {
                            //check image present or not
                            if ( fs.existsSync(`./upload/${fileType}`)) 
                            {
                              return h.response({ message: "image already present" });
                            }
                              else{
                                //add to image on that folder
                                fs.writeFile(`./upload/${fileType}`, imagePath._data, (err) => {
                                })
                                if (result) //all details are correct
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
                                  return "not updated details";
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

                }
                else{
                  return 'no software id available'
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
                  softwareId: Joi.string(),
                }),
                payload: Joi.object({
                
                  Name:Joi.string().default('software name'),
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
                description: "Update software",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public countAllSoftwares(){
          return{
              method: "GET",
             path: "/countAllSoftwares",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.softwares;
               //count of all available machine
                const result = await getTableData.findAll({
                attributes: [[Sequelize.fn('count', Sequelize.col('softwareId')),'totalCount']],
                });
                if(result!==null){
                  return JSON.stringify(result,null,2)
                }else{
                  return 'no software available';
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
      //quantity of software available
        public checkQuantityOfSoftware(){
          return{
              method: "GET",
             path: "/checkQuantityOfSoftware/{softwareId}",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.softwares;
                const {softwareId} =request.params;
               //sum of the quantity
                const result = await getTableData.findAll({ 
                attributes: [[Sequelize.fn('sum', Sequelize.col('quantity')),'quantity']],
                where:{
                  softwareId:softwareId
             }, 
                });
                if(result!==null){
              
                    return JSON.stringify(result,null,2)
                
                }else{
                  return 'no data';
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              validate: {
                params: Joi.object({
                  softwareId: Joi.number(),
                  
                }),
              },
             
              description: "quantity of softwares",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }     
        deleteSoftwareDetails() {
          return {
            method: "DELETE",
            path: "/deleteSoftwareDetails/{softwareId}",
            handler: async (request: any, h:Hapi.ResponseToolkit) => {
              
                const dataBase = await request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.softwares;
              const softwareIds = request.params.softwareId;
              const image=await getTableData.findOne({
                where:{softwareId:softwareIds}
              })
              const result=await getTableData.destroy({
                where:{softwareId:softwareIds}
              })
              if(result){
                //delete image from folder
                try{
                  await fs.unlink(`${image.imagePath}`,(err)=>{
                  if(err){
                    console.log(err)
                  }
              });
              return  h.response('deleted')
               }
               catch(err){
                console.log(err);
               }
              }
          else{
            return 'not found software id'
          }
          
            },
            options: {
              validate: {
                params: Joi.object({       
                  softwareId:Joi.number()
                }),
              },
              description: "Delete software",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public filterSoftwarePrice(){
          return{
              method: "GET",
             path: "/filterSoftwarePrice",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.softwares;
                //filter the price low to high and get data ascending order
                const result = await getTableData.findAll({
                attributes: ['Name','quantity',[Sequelize.fn('sum', Sequelize.col('price')),'price']],
                 
                  group : ['softwareId'],
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
              description: "filter software",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }     

        public searchSoftwares(){
          return{
              method: "GET",
             path: "/searchSoftwares/{Name}",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("InventoryManagementDatabase");
                const getTableData = dataBase.models.softwares;
               //search the product
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
                }
                else{
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
             
              description: "filter software",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
      }
























      // removeSoftwareDetails() {
      //   return {
      //     method: "DELETE",
      //     path: "/removeSoftwareDetails/{softwareId}",
      //     handler: async (request: any, h: Hapi.ResponseToolkit) => {
            
      //         const dataBase = await request.getDb("InventoryManagementDatabase");
      //         const getTableData = dataBase.models.softwares;
      //       const searchId = request.params.softwareId;
      //       const result = await getTableData.destroy({
      //         where: { softwareId: searchId },
      //       });
      //       if (result) {
      //         return 'deleted'
      //       } else {
      //         return "not found";
      //       }
      //     },
      //     options: {
      //       validate: {
      //         params: Joi.object({
      //           //name: Joi.string()
      //           //searchFname: Joi.string(),
      //           softwareId:Joi.number()
      //         }),
      //       },
      //       description: "Delete software",
      //       notes: "Returns a todo item by the id passed in the path",
      //       tags: ["api"], // ADD THIS TAG
      //     },
      //   };
      // }
    