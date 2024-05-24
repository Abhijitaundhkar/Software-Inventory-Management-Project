import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";

export class productOrderController{

  public addProductOrders(){
      return{
      method: "POST",
      path: "/{productId}/{employeeId}",
      handler: async function (request: any, h: Hapi.ResponseToolkit) {
      try{
       //get the database
      const dataBase = request.getDb("softwareMachineDatabase");
      const getOrderTableData = dataBase.models.orderData;//order table
      const getProductTableData=dataBase.models.product//software table
      const getEmployeeTableData=dataBase.models.employee//employee table
      const productIds=request.params.productId
      const employeeIds=request.params.employeeId
  
      const {date} =request.payload;        
      //find the software is present or not
        const productData=await getProductTableData.findOne({
          attributes: ['productId','productType','productName','price','quantity'],
          where:{productId:productIds},
 
        })
        //check employee present or not
        if(productData!==null)
        {
          const employeeData=await getEmployeeTableData.findOne({
            attributes: ['employeeId'],
            where:{employeeId:employeeIds},
   
          })
          if(employeeData!==null)
          {
            //check quantity is available
            if(request.query.purchase<=productData.quantity)
            {
            //get  create order
            const createOrder=await getOrderTableData.create({
              productId:productIds,
              employeeId:employeeIds,
              quantity:request.query.purchase,
              priceDetails:productData.price,
              date:date,
            });
           //find details of order table 
              const orderData=await getOrderTableData.findOne
              ({
                attributes: ['orderId','employeeId','productId','quantity','priceDetails'],
                where:{orderId:createOrder.orderId}
                });
                // update the values to database
                productData.quantity=productData.quantity-orderData.quantity
                orderData.priceDetails=productData.price*orderData.quantity
                  await orderData.save()
                  await productData.save()
                  //product and order table join and get all details from order data
                        const joinData=await getProductTableData.findOne({
                          include: 
                          {
                            model: getOrderTableData,
                           attributes:['orderId','employeeId','quantity','priceDetails'],
                            required:true,
                            where:{orderId:createOrder.orderId},
                            include:{
                            model: getEmployeeTableData,
                            attributes:['firstName','lastName']
                          },
                        }
                        })
                  
                        return JSON.stringify(joinData,null,2)
                                                
                      }
                      else{
                      return ' sorry no quantity available'
                      }
                    }
                  else
                  {
                  return 'wrong employee id not available'
                   }  
            }
            
          else{
            return 'wrong product id not available'
          }    
      }
        catch(err){
          console.log(err)
          }          
            },

          options: 
          {
            validate:
            {
                params:Joi.object({
                  productId:Joi.number(),
                  employeeId:Joi.number().min(1)
                  }),
                query:Joi.object({
                    purchase:Joi.number().min(1)
                }),
                    payload: Joi.object({
                      date:Joi.date()

                    }),
              },
            description: "Add productOrders",
            notes: "Returns a todo item by the id passed in the path",
            tags: ["api"], // ADD THIS TAG
          },
  };
}
   

         public getAllProductOrders() {
          return {
            method: "GET",
            path: "/ProductOrders",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("softwareMachineDatabase");
                const getProductTableData = dataBase.models.product;
                const getOrderTableData = dataBase.models.orderData;
               //get softwareOrder and software details
                const productData=await getProductTableData.findAll({
                  include: [
                          {
                            model: getOrderTableData,
                            required:true,
                            order: [
                              ['orderId', 'ASC']
                            ]
                           
                          }],
                          
                })
                //if order is present 
                if (productData.length>=1) {
                  return JSON.stringify(productData, null, 2);
                }
                 else {
                  return h.response({ message: "no Orders" });
                }
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              
              description: "show productOrders",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public updateProductOrders(){
          return{

            method: "PUT",
            path: "/ProductOrders/{orderId}/{productId}",
            handler: async function (request: any, h: Hapi.ResponseToolkit) {
             
               const dataBase = request.getDb("softwareMachineDatabase");
               const getOrderTableData = dataBase.models.orderData;
               const getProductTableData = dataBase.models.product;
               const productIds=request.params.productId

               const productData=await getProductTableData.findOne({
                attributes: ['price','productId','quantity'],
                where:{productId:productIds},
              })
              //check quantity is available or not
              if(productData.quantity>=request.payload.quantity)
              {
  
                const orderData = await getOrderTableData.findOne({
                  attributes: ['orderId','productId','employeeId','quantity'],
                  where: { orderId: request.params.orderId, productId: request.params.productId},
                });
                //update the values to software and order table
               if(orderData)
               {
                  productData.quantity=productData.quantity -request.payload.quantity
                  orderData.quantity=request.payload.quantity
                  orderData.priceDetails=productData.price*request.payload.quantity
                
                    await orderData.save();
                    await productData.save();
                    //join the tables and get the data
                    const joinData=await getProductTableData.findOne({
                      include: [
                      {
                        model: getOrderTableData,
                        required:true,
                        attributes: ['orderId','employeeId','quantity','priceDetails','date'],
                        where:{orderId:request.params.orderId}
                        
                      }],
                      attributes: ['productId','productType','productName','description','price','imagePath'],
                        
                    })      
                   
               return JSON.stringify(joinData,null,2)                   
        }
        else{
            return 'product id and order id not match'
        }   
      }
          else{

            return 'no quantity available'
          }
              
           },
           options: {
             validate: {
              params:Joi.object({
                orderId:Joi.number(),
                productId:Joi.number(),
               }),
               payload: Joi.object({
                 quantity:Joi.number().min(1),
               }),
             },
             description: "update Orders",
             notes: "Returns a todo item by the id passed in the path",
             tags: ["api"], // ADD THIS TAG
           },
         };
       }

       public deleteProductOrders() {
        return {
          method: "DELETE",
          path: "/ProductOrders/{orderId}",
          handler: async (request: any, h: Hapi.ResponseToolkit) => {
            try {
              const dataBase = await request.getDb("softwareMachineDatabase");
              const getOrderTableData = dataBase.models.orderData;
              //const getProductTableData = dataBase.models.orderData;
            
              const result=await getOrderTableData.destroy({                    
                where:{orderId:request.params.orderId}
               });
           
              if (result) {
                
                return 'deleted data'
              }
               else {
                return h.response({ message: "no Orders" });
              }
            } catch (err) {
              console.log(err);
            }
          },
          options: {
            validate: {
              params: Joi.object({
                orderId: Joi.number(),
                
              }),
            },
            description: "delete Orders",
            notes: "Returns a todo item by the id passed in the path",
            tags: ["api"], // ADD THIS TAG
          },
        };
      }

      public productOrderById() {
        return {
          method: "GET",
          path: "/{orderId}",
          handler: async (request: any, h: Hapi.ResponseToolkit) => {
            try {
              const dataBase = await request.getDb("softwareMachineDatabase");
               const getProductTableData = dataBase.models.product;
               const getOrderTableData = dataBase.models.orderData;
                const  orderIds=request.params.orderId
                const result=await getProductTableData.findOne({
                  include: [
                  {
                    model: getOrderTableData,
                    required:true,
                    attributes: ['orderId','employeeId','quantity','priceDetails','date'],
                    where:{orderId:orderIds}
                   
                  }],
                  attributes: ['productId','productType','productName','description','price','imagePath'],
                    
                }) 
                 if (result)
                {
                 return JSON.stringify(result, null, 2);
               }
                else {
                 return h.response({ message: "no Orders" });
               }
             
      
      }
      catch (err) {
          console.log(err);
        }
          },
          options: {
      validate: {
        params: Joi.object({
          orderId: Joi.number(),
        }),
      },
      description: "show Orders by id",
      notes: "Returns a todo item by the id passed in the path",
      tags: ["api"], // ADD THIS TAG
    
    }
  }
 }
      public orderDetailsByEmployee() {
        return {
          method: "GET",
          path: "/ProductOrders/{employeeId}",
          handler: async (request: any, h: Hapi.ResponseToolkit) => {
            try {
              const dataBase = await request.getDb("softwareMachineDatabase");
               const getEmployeeTableData = dataBase.models.employee;
              // const getProductTableData=dataBase.models.product
               const getOrderTableData = dataBase.models.orderData;
               const  employeeIds=request.params.employeeId
           //join the table get order and employee data
            const joinData=await getEmployeeTableData.findOne({
                  include: [
                  {
                    model: getOrderTableData,
                    required:true,
                   },
                ],
                attributes: ['firstName','lastName'],
               where:{employeeId:employeeIds}
            })
            if (joinData)
            {
             return JSON.stringify(joinData, null, 2);
           }
            else {
             return h.response({ message: "no employee" });
           }
          
      
      }
      catch (err) {
          console.log(err);
        }
          },
          options: {
      validate: {
        params: Joi.object({
          employeeId: Joi.number(),         
        }),
      },
      description: "show employee order by id",
      notes: "Returns a todo item by the id passed in the path",
      tags: ["api"], // ADD THIS TAG
    
  }
}
  
  }
}


   
          // const result=await sequelize.query(`select employees."firstName",employees."lastName","orderData".* ,"product".* from "employees" inner join "orderData" on "employees"."employeeId"="orderData"."employeeId" inner join "softwares"  on "softwares"."productId"="orderData"."softwareId" where "employees"."employeeId"=${employeeIds}`,{
          //   type:Sequelize.QueryTypes.SELECT

          // })

//         public addSoftwareOrders(){
//             return{

//               method: "POST",
//               path: "/addSoftwareOrders/{softwareId}",
//               handler: async function (request: any, h: Hapi.ResponseToolkit) {
//                try{
//                 const dataBase = request.getDb("softwareMachineDatabase");
//                 // console.log(dataBase)
//                 const getOrderTableData = dataBase.models.softwareOrders;
//                 const getTableData1=dataBase.models.softwares
//                // console.log("data", getTableData1.softwareId)
//                 const softwareIds=request.params.softwareId
//                 console.log("database", getTableData1);
//                 const {quantity,priceDetails,date} =request.payload;        
                
//                   const result=await getTableData1.findOne({
//                     attributes: ['softwareId','price','quantity'],
//                     where:{softwareId:softwareIds},
           
//                   })
//                   if(request.query.purchase<=result.quantity)
//                   {
//                       //get table order and create order
//                     const createOrder=await getTableData.create({
//                       // orderId:orderId,
//                       softwareId:softwareIds,
//                       quantity:quantity,
//                       priceDetails:priceDetails,
//                       date:date,
//                       });
      
//                         const orderData=await getTableData.findOne
//                         ({
//                           attributes: ['orderId','softwareId','quantity','priceDetails'],
//                           where:{orderId:createOrder.orderId}
//                           });

//                           result.quantity=result.quantity-result1.quantity
//                           result1.priceDetails=result.price*result1.quantity
//                                   // console.log( 'aa',result1.priceDetails)
//                                   // console.log( 'aab',result.quantity)
//                                   //console.log('asss',orderIds)
//                                   // console.log( 'aac',result1.quantity)
//                                   // console.log('assas',result1)
//                                   //  const orderIds=result1.orderId
                                         
//                                   await result1.save()
//                                   await result.save()
//                                   const result3=await getTableData.findOne({
//                                     include: [
//                                     {
//                                       model: getTableData1,
//                                       required:true,
//                                       attributes: ['Name','description','price','imagePath']
                                      
//                                     }],
//                                     attributes: ['orderId','quantity','priceDetails'],
//                                     where:{orderId:createOrder.orderId}
//                                   })
//                                   return JSON.stringify(result3,null,2)
                                                          
//         }
//         else{

//           return 'noooo order'
//         }
//     }
              
//       catch(err){
//         console.log('no machine id',err,)
//         }          
//          },

//           options: 
//           {
//             validate:
//              {
//                 params:Joi.object({
//                 softwareId:Joi.number(),
//               //   orderId:Joi.number().min(1)
//                   }),
//                         query:Joi.object({
//                     purchase:Joi.number().min(1)
//                     }),
//                         payload: Joi.object({
                    
//                           quantity:Joi.number().min(1),
//                           priceDetails:Joi.number(),
//                           date:Joi.date()
                          
                      
//                         }),
//             },
      
//                 description: "Add softwareOrders",
//                 notes: "Returns a todo item by the id passed in the path",
//                 tags: ["api"], // ADD THIS TAG
//     },
//   };
// }







  //   public addSoftwareOrders(){
  //     return{

  //       method: "POST",
  //       path: "/addSoftwareOrders",
  //       handler: async function (request: any, h: Hapi.ResponseToolkit) {
         
  //          const dataBase = request.getDb("InventoryManagementDatabase");
  //          console.log(dataBase)
  //          const getTableData = dataBase.models.softwareOrders;
  //          const getTableData1 = dataBase.models.softwares;
  //          const softwareIds=request.payload.softwareId
  //          console.log("database", getTableData1);
  //          const {softwareId,quantity,priceDetails,date} =request.payload;
  //          const result=await getTableData1.findOne({
        
  //           attributes: ['quantity','price','softwareId'],
  //           where:{softwareId:softwareIds},
            
  //          // group:['machineId']

  //         })
  //         console.log("database", result.quantity);
  //          if( result.quantity>=1){
  //            await getTableData.create({
  //           // orderId:orderId,
  //           softwareId:softwareId,
  //           quantity:quantity,
  //           priceDetails:priceDetails,
  //           date:date,
  //          });
  //          return JSON.stringify(result, null, 2);
  //         }
  //         else{
  //           return 'no software available'
  //         }
  //      },
  //      options: {
  //        validate: {
  //          query:Joi.object({
  //           //softwareId:Joi.number()
  //          }),
  //          payload: Joi.object({
  //           //orderId: Joi.number().min(1),
             
  //            softwareId:Joi.number(),
  //            quantity:Joi.number().min(1),
  //            date:Joi.date()
             
          
  //          }),
  //        },
  //        description: "Add softwareOrders",
  //        notes: "Returns a todo item by the id passed in the path",
  //        tags: ["api"], // ADD THIS TAG
  //      },
  //    };
  //  }
  //
  // public updateSoftwareQuantity(){
  //   return{
  //     method:"PUT",
  //     path:"/softwares/updateSoftwareQuantity/{softwareId}/{orderId}",
  //     handler:async(request:any,h:Hapi.ResponseToolkit)=>
  //     {
  //       try{
  //           const dataBase=await request.getDb('InventoryManagementDatabase')
  //           const getTableData=dataBase.models.softwares
  //           const getTableData1=dataBase.models.softwareOrders
  //           const softwareId=request.params.softwareId
  //           const orderId=request.params.orderId
  //           const result=await getTableData.findOne({
  //             attributes: ['quantity','softwareId'],
  //             where:{softwareId:softwareId},
  //            // group:['machineId']
  
  //           })
  //           console.log('ssassa',result)
  //           if(result!==null)
  //           {
  //             const result1=await getTableData1.findOne({
  //               attributes: ['quantity','softwareId','orderId'],
  //               where:{orderId:orderId},
  //               //group:['machineId']
  //             });
  //             console.log('assas',result1)
  //             if(result1)
  //             {
              
  //               result.quantity=result.quantity -result1.quantity
  //               console.log( 'aa',result.quantity)
  //               if(result.quantity>=0){
  //                 await result.save()
  //                 return JSON.stringify(result,null,2)
  //               }
  //               else{
  //                 return '0  product available'
  //               }
                 
  //             }
  //             else{
  //               return  "orderId not match"
  //             }
  //           }
  //           else{
  //             return 'not software id available'
  //           }
  //         }
  //         catch(err){
  //           console.log(err)
  //         }
  //         },
  //           options:{
  //               validate:{
  //                   params:Joi.object({
  //                     softwareId:Joi.number(),
  //                     orderId:Joi.number()
  //                   }),
  //                   // payload:Joi.object({
  //                   //   quantity:Joi.number()
  //                   // })
  
  //                 },
  //           description: " update quantity software ",
  //           notes: "Returns a todo item by the id passed in the path",
  //           tags: ["api"], // ADD THIS TAG
  //     }
  //   }
  // }
















  // public updateSoftwarePrice(){
  //   return{
  //     method:"PUT",
  //     path:"/softwares/updateSoftwarePrice/{softwareId}/{orderId}",
  //     handler:async(request:any,h:Hapi.ResponseToolkit)=>
  //     {
  //       try{
  //           const dataBase=await request.getDb('InventoryManagementDatabase')
  //           const getTableData=dataBase.models.softwares
  //           const getTableData1=dataBase.models.softwareOrders
  //           const softwareId=request.params.softwareId
  //           const orderId=request.params.orderId
  //           const result=await getTableData.findOne({
        
  //             attributes: ['price','softwareId'],
  //             where:{softwareId:softwareId},
              
  //            // group:['machineId']
  
  //           })
  //           console.log('ssassa',result)
  //           if(result)
  //           {
  //             const result1=await getTableData1.findOne({
  //               attributes: ['orderId','softwareId','quantity','priceDetails'],
  //               where:{orderId:orderId},
              
  //               //group:['machineId']
  //             });
  //             console.log('assas',result1)
  //             if(result1)
  //             {
                
  //               result1.priceDetails=result.price*result1.quantity
  //               console.log( 'aa',result1.priceDetails)

  //                 await result1.save()
  //                 return JSON.stringify(result1,null,2)
  //               }
  //               else{
  //                 return 'orderId not available'
  //               }
                 
  //             }
            
  //           else{
  //             return ' software id not fount'
  //           }
  //         }
  //         catch(err){
  //           console.log(err)
  //         }
  //         },
  //           options:{
  //               validate:{
  //                   params:Joi.object({
  //                     softwareId:Joi.number(),
  //                     orderId:Joi.number()
  //                   }),
  //                   // payload:Joi.object({
  //                   //   quantity:Joi.number()
  //                   // })
  
  //                 },
  //           description: "price softwareOrders ",
  //           notes: "Returns a todo item by the id passed in the path",
  //           tags: ["api"], // ADD THIS TAG
  //     }
  //   }
  // }
                
