import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";
import { Sequelize ,Op} from "sequelize";
import * as fs from 'fs'

export class productController{
  
        public addNewProduct(){
            return{
              method: "POST",
              path: "/products",
              handler: async function (request: any, h: Hapi.ResponseToolkit) {
                try {
                  const dataBase = request.getDb("softwareMachineDatabase");
                  const getTableData = dataBase.models.product;
                  const { imagePath} =request.payload;
                  //find machine name already present or not
                  const checkProductName=await getTableData.findOne({where:{productName:request.payload.productName}}) 
                  if(checkProductName)
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
                            fs.writeFile(`./upload/${fileType}`, imagePath._data, (err:any) => {
                            if(err)
                            {
                              console.log(err)
                            }                           
                          })
                        //add machines
                        getTableData.create({
                          productType:request.payload.productType,
                          productName: request.payload.productName,
                          description:request.payload.description,
                          price:request.payload.price,
                           quantity:request.payload.quantity,
                          imagePath: `./upload/${imagePath.hapi.filename}`,
                          
                        });
                      
                        return h.response('product added');
          
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
                
                validate: {
                  payload: Joi.object({
                    productType: Joi.string().valid('machine','software').required(),
                    productName:Joi.string().default('software/machine name').required(),
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
      
               description: "Add machines/software",
               notes: "Returns a todo item by the id passed in the path",
               tags: ["api"], // ADD THIS TAG
             },
           };
         }
         public getAllProductDetails() {
          return {
            method: "GET",
            path: "/products",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("softwareMachineDatabase");
                const getTableData = dataBase.models.product;
               // get software details ascending order
                const result=await getTableData.findAll({                    
                  order:[[
                    'productId','ASC'
                  ]]
                 })  
              //data present 1 or more
                if (result.length>=1) {
                  console.log(result);
                  return JSON.stringify(result, null, 2);
                } else {
                  return h.response({ message: "no products available"});
                }
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              description: "get details software/machine",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public updateProductDetails() {
          return {
            method: "PUT",
            path: "/products/{productId}",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("softwareMachineDatabase");
                const getTableData = dataBase.models.product;
                  const searchId = request.params.productId;
                  const { imagePath} =request.payload;
              //find id present or not
              const result = await getTableData.findOne({
                where: { productId: searchId } ,
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
                                fs.writeFile(`./upload/${fileType}`, imagePath._data, (err:any) => {
                                }
                                )
                               //all details are correct so update data 
                                 result.productType=request.payload.productType,
                                  result.productName=request.payload.productName,
                                  result.description=request.payload.description,
                                  result.price=request.payload.price,
                                  result.quantity=request.payload.quantity,
                                  result.imagePath=`./upload/${imagePath.hapi.filename}`
                                  await result.save();
                                  return JSON.stringify(result, null, 2);
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
                  return 'no product id available'
                }

              }
                catch (error:any) {
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
                  productId: Joi.string(),
                }),
                payload: Joi.object({
                  productType: Joi.string().valid('machine','software').required(),
                  productName:Joi.string().default('product name'),
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
                description: "Update software/machine",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public countAllProduct(){
          return{
              method: "GET",
             path: "/products",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("softwareMachineDatabase");
                const getTableData = dataBase.models.product;
               //count of all available machine
                const getCount = await getTableData.findAll({
                attributes: ['productType',[Sequelize.fn('count', Sequelize.col('productId')),'totalCount']],
                group:['productType']
                });
                if(getCount.length>=1){
                  return JSON.stringify(getCount,null,2)
                }else{
                  return 'no product available';
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
            
              description: "count product",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }     
      //quantity of software available
        public checkQuantityOfProduct(){
          return{
              method: "GET",
             path: "/products/{productId}",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("softwareMachineDatabase");
                const getTableData = dataBase.models.product;
                const {productId} =request.params;
               //sum of the quantity 
                const result = await getTableData.findOne({ 
                attributes: ['productType','productName',[Sequelize.fn('sum', Sequelize.col('quantity')),'quantity']],
                where:{
                  productId:productId
             }, 
             group:['productType','productName']
                });
                if(result!==null){
              
                    return JSON.stringify(result,null,2)
                
                }else{
                  return 'no product id available';
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              validate: {
                params: Joi.object({
                  productId: Joi.number(),
                  
                }),
              },
             
              description: "quantity of product",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }     
        deleteProductDetails() {
          return {
            method: "DELETE",
            path: "/products/{productId}",
            handler: async (request: any, h:Hapi.ResponseToolkit) => {
                const dataBase = await request.getDb("softwareMachineDatabase");
                const getTableData = dataBase.models.product;
                 const productIds = request.params.productId;
              //find the image path
              const getImagePath=await getTableData.findOne({
                where:{productId:productIds}
              })
              //delete the product
              const result=await getTableData.destroy({
                where:{productId:productIds}
              })
              if(result){
                //delete image from folder
                try{
                  //delete the image from upload folder
                 fs.unlink(`${getImagePath.imagePath}`,(err)=>{
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
            return 'not found product id'
          }
          
            },
            options: {
              validate: {
                params: Joi.object({
                  productId:Joi.number()
                }),
              },
              description: "Delete software",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public filterProductPrice(){
          return{
              method: "GET",
             path: "/products/filterPrice",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("softwareMachineDatabase");
                const getTableData = dataBase.models.product;
                //filter the price low to high and get data ascending order
                const result = await getTableData.findAll({
                  order:[['price','ASC']]
                });
                if(result.length>=1)
                {
                  return h.response({
                    msg: 'filter result',
                    product:result
                  })
                }else{
                  return 'no product available';
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

        public searchProduct(){
          return{
              method: "GET",
             path: "/products/{productName}",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("softwareMachineDatabase");
                const getTableData = dataBase.models.product;

               //search the product by name
                const result = await getTableData.findAll({
                  where: {
                    productName: {
                      [Op.like]: request.params.productName +'%' 
                    }
                    },
                    order:[
                      [
                      'productName', 'ASC']
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
                  productName: Joi.string()
                  
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
      //     path: "/removeSoftwareDetails/{productId}",
      //     handler: async (request: any, h: Hapi.ResponseToolkit) => {
            
      //         const dataBase = await request.getDb("softwareMachineDatabase");
      //         const getTableData = dataBase.models.product;
      //       const searchId = request.params.productId;
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
    