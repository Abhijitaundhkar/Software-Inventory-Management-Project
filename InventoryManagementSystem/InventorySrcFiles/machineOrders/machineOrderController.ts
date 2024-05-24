import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";

export class machineOrderController{

    public addMachineOrders(){
      return{
      method: "POST",
      path: "/addMachineOrders/{machineId}/{employeeId}",
      handler: async function (request: any, h: Hapi.ResponseToolkit) {
       try{
         //get the database
        const dataBase = request.getDb("InventoryManagementDatabase");
        const getOrderTableData = dataBase.models.orderData;//order table
        const getMachineTableData=dataBase.models.machines//machine table
        const getEmployeeTableData=dataBase.models.employee//employee table
        const machineIds=request.params.machineId
        const employeeIds=request.params.employeeId
        const {date} =request.payload;        
        //get machine table
          const machineData=await getMachineTableData.findOne({
            attributes: ['machineId','price','quantity'],
            where:{machineId:machineIds},
   
          })
          //get employee table
          if(machineData!==null){
          const employeeData=await getEmployeeTableData.findOne({
            attributes: ['employeeId'],
            where:{employeeId:employeeIds},
   
          })
          if(employeeData!==null)
          {
            if(request.query.purchase<=machineData.quantity)
             {
              //get table order and create order
            const createOrder=await getOrderTableData.create({
              // orderId:orderId,
              machineId:machineIds,
              employeeId:employeeIds,
              quantity:request.query.purchase,
              priceDetails:machineData.price,
              date:date,
              });
              //get order table
                const orderData=await getOrderTableData.findOne
                ({
                  attributes: ['orderId','machineId','quantity','priceDetails'],
                  where:{orderId:createOrder.orderId}
                  });
                  //update the data
                  machineData.quantity=machineData.quantity-orderData.quantity
                  orderData.priceDetails=machineData.price*orderData.quantity       
                  await orderData.save()
                  await machineData.save()
                  //join the two tables
                  const joinData=await getMachineTableData.findOne({
                    include: [
                    {
                      model: getOrderTableData,
                      required:true,
                      attributes: ['orderId','employeeId','quantity','priceDetails','date'],
                      where:{orderId:createOrder.orderId}
                      
                    }],
                    attributes: ['machineId','Name','description','price','imagePath']
                  })
                  return JSON.stringify(joinData,null,2)                          
            }
            else{
            
            return 'no product available'
            }
            }
          
          else{
              return 'no employeeId available'
          }
        }else{
          return 'no machineId available'
        }
          
      }catch(err){
            console.log('no machine id',err,)
            }          
            },
        options: 
        {
          validate:
          {
              params:Joi.object({
              machineId:Joi.number(),
              employeeId:Joi.number()
                }),
               query:Joi.object({
                  purchase:Joi.number().min(1)
                  }),
                  payload: Joi.object({
                        date:Joi.date()
                }),
          },
        description: "Add MachineOrders",
        notes: "Returns a todo item by the id passed in the path",
        tags: ["api"], // ADD THIS TAG
    },
   };
  }
         public getOrderDetails() {
          return {
            method: "GET",
            path: "/getOrderDetails",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("InventoryManagementDatabase");
                const getMachineTableData = dataBase.models.machines;
               const getOrderTableData = dataBase.models.orderData;
            
        // find machine data and inner join with order table
             const result=await getMachineTableData.findAll({
              include: [
                {
                  model: getOrderTableData,
                  required:true,
                  attributes: ['orderId','employeeId','quantity','priceDetails','date'],
                  order: [
                    ['orderId', 'ASC']
                  ]
                 
                }],
                attributes: ['machineId','Name','description','price','imagePath'],
              
              })
              //data is present 1 or more 
                if (result.length>=1) {
               
                  return JSON.stringify(result, null, 2);
                }
                 else {
                  return h.response({ message: "no machineOrders" });
                }
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              description: "show machineOrders",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public updateMachineOrders(){
          return{

            method: "PUT",
            path: "/updateMachineOrders/{orderId}/{machineId}",
            handler: async function (request: any, h: Hapi.ResponseToolkit) {
             
               const dataBase = request.getDb("InventoryManagementDatabase");
               const getOrderTableData = dataBase.models.orderData;//order table
               const getMachineTableData=dataBase.models.machines
               const machineId=request.params.machineId
              //get details of machines
               const machineData=await getMachineTableData.findOne({
                attributes: ['price','machineId','quantity'],
                where:{machineId:machineId},
          
              })
              //check quantity is available or not
              if(machineData.quantity>=request.payload.quantity)
              {
                const orderData = await getOrderTableData.findOne({
                  attributes: ['orderId','machineId','quantity'],
                  where: { orderId: request.params.orderId, machineId: request.params.machineId},
                });
            //update the values in database
            if(orderData)
            {
              machineData.quantity=machineData.quantity -request.payload.quantity
              orderData.quantity=request.payload.quantity
              orderData.priceDetails=machineData.price*request.payload.quantity
              //save the updates
                await orderData.save();
                await machineData.save();
                const joinData=await getMachineTableData.findOne({
                  include: [
                  {
                    model: getOrderTableData,
                    required:true,
                    attributes: ['orderId','employeeId','quantity','priceDetails','date'],
                    where:{orderId:request.params.orderId}
                    
                  }],
                  attributes: ['Name','description','price','imagePath']
                    
                })    
                return JSON.stringify(joinData, null, 2);  
              }
              else{
                return 'no order id and machine id not match'
              }
      }
      else{
        return 'sorry No quantity available'
      }
              
           },
           options: {
             validate: {
              params:Joi.object({
                orderId:Joi.number(),
                machineId:Joi.number(),
               }),
               payload: Joi.object({
                //orderId: Joi.number().min(1),
                 quantity:Joi.number().min(1),
                // date:Joi.date()
               }),
             },
             description: "update machineOrders",
             notes: "Returns a todo item by the id passed in the path",
             tags: ["api"], // ADD THIS TAG
           },
         };
       }

 

       public deleteOrder() {
        return {
          method: "DELETE",
          path: "/deleteOrder/{orderId}",
          handler: async (request: any, h: Hapi.ResponseToolkit) => {
            try {
              const dataBase = await request.getDb("InventoryManagementDatabase");
              const getOrderTableData = dataBase.models.orderData;
             // const getOrderTableData = dataBase.models.managers;
              const result=await getOrderTableData.destroy({                    
                where:{orderId:request.params.orderId}
               });
           
              if (result) {
                return JSON.stringify(result,null,2)
              }
               else {
                return h.response({ message: "no machineOrders" });
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
            description: "delete machineOrders",
            notes: "Returns a todo item by the id passed in the path",
            tags: ["api"], // ADD THIS TAG
          },
        };
      }
      public OrderDetailsById() {
        return {
          method: "GET",
          path: "/OrderDetailsById/{orderId}",
          handler: async (request: any, h: Hapi.ResponseToolkit) => {
            try {
              const dataBase = await request.getDb("InventoryManagementDatabase");
               const getMachineTableData = dataBase.models.machines;
               const getOrderTableData = dataBase.models.orderData;
                const  orderId=request.params.orderId
                //get order details by machine id
                const joinData=await getMachineTableData.findOne({
                  include: [
                    {
                      model: getOrderTableData,
                      required:true,
                      attributes: ['orderId','employeeId','quantity','priceDetails','date'],
                      where:{orderId:orderId},
                     
                    }],
                    attributes: ['machineId','Name','description','price','imagePath'],
      
                    })
                       if (joinData)
                        {
                          return JSON.stringify(joinData, null, 2);
                        }
                        else {
                          return h.response({ message: "no machineOrders" });
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
                  description: "show machineOrders by id",
                  notes: "Returns a todo item by the id passed in the path",
                  tags: ["api"], // ADD THIS TAG
      
  }
  }
 }
}
     

    






  //       public addMachineOrders(){
  //           return{

  //             method: "POST",
  //             path: "/addMachineOrders/{machineId}",
  //             handler: async function (request: any, h: Hapi.ResponseToolkit) {
  //     try{
  //         const dataBase = request.getDb("InventoryManagementDatabase");
  //         // 
  //         const getTableData = dataBase.models.orderData;
  //         const getOrderTableData=dataBase.models.machines
  //         console.log("data", getOrderTableData.machineId)
  //         const machineIds=request.params.machineId
  //         console.log("database", getOrderTableData);
  //         const {quantity,priceDetails,date} =request.payload;        
          
  //           const result=await getOrderTableData.findOne({
  //             attributes: ['machineId','price','quantity'],
  //             where:{machineId:machineIds},
     
  //           })
  //           if(request.query.purchase<=result.quantity)
  //           {
           
  //             const createOrder=await getTableData.create({
  //               // orderId:orderId,
  //               machineId:machineIds,
  //               quantity:quantity,
  //               priceDetails:priceDetails,
  //               date:date,
  //               });
  //            const result1=await getTableData.findOne
  //                       ({
  //                         attributes: ['orderId','machineId','quantity','priceDetails'],
  //                         where:{orderId:createOrder.orderId}
  //                         });
  //                       console.log('assas',result1)
  //                       const orderIds=result1.orderId
  //                       console.log('asss',orderIds)
                      
  //                           result.quantity=result.quantity-result1.quantity
  //                           result1.priceDetails=result.price*result1.quantity
  //                           console.log( 'aa',result1.priceDetails)
  //                           console.log( 'aab',result.quantity)
  //                           console.log( 'aac',result1.quantity)
                                
  //                                       await result1.save()
  //                                       await result.save()
  //                                       const result3=await getTableData.findOne({
  //                                         include: [
  //                                         {
  //                                           model: getOrderTableData,
  //                                           required:true,
  //                                           attributes: ['Name','description','price','imagePath']
                                           
  //                                         }],
  //                                         attributes: ['orderId','quantity','priceDetails'],
  //                                         where:{orderId:createOrder.orderId}
  //                                       })
  //                                       return JSON.stringify(result3,null,2)
                                                      
        
  //         }
  //         else{
  //           return 'sorry no order'
  //         }
  //       }
          
  //         catch(err){
  //           console.log('no machine id',err,)
  //          } 
               
               
  //  },

  //            options: {
  //              validate: {
  //               params:Joi.object({
  //              machineId:Joi.number(),
  //             //   orderId:Joi.number().min(1)
  //                }),
  //                query:Joi.object({
  //                 purchase:Joi.number(),
  //                //   orderId:Joi.number().min(1)
  //                   }),
  //                payload: Joi.object({
             
  //                  quantity:Joi.number().min(1),
  //                  priceDetails:Joi.number(),
  //                  date:Joi.date()
                   
                
  //                }),
  //              },
  //              description: "Add machineOrders",
  //              notes: "Returns a todo item by the id passed in the path",
  //              tags: ["api"], // ADD THIS TAG
  //            },
  //          };
  //        }







  //           if(create)
            //          {
            //            const result1=await getTableData.findOne({
            //              attributes: ['orderId','machineId','quantity','priceDetails'],
            //              where:{orderId:orderId},
                       
            //              //group:['machineId']
            //            });
            //            console.log('assas',result1)
            //         if(result1)
            //         {
            //           result.quantity=result.quantity-result1.quantity
            //           result1.priceDetails=result.price*result1.quantity
            //           console.log( 'aa',result1.priceDetails)
            //           console.log( 'aab',result.quantity)
            //           console.log( 'aac',result1.quantity)
            //           await result1.save()
            //             await result.save()
            //             return JSON.stringify(result1,null,2)

            //           //  if(result.quantity>=0)

            //           //   await result1.save()
            //           //   await result.save()
            //           //   return JSON.stringify(result1,null,2)
            //           // }
            //           // else{
            //           //   return '0 product available'
            //           // }
            //           }
            //           else{
            //             return 'orderid not available'
            //           }
            //         }
            //       }
            //         else{
            //           return 'no data'
            //         }
                  
            //    }

              
        // public updateMachineQuantity(){
        //   return{
        //     method:"PUT",
        //     path:"/machine/updateMachineQuantity/{machineId}/{orderId}",
        //     handler:async(request:any,h:Hapi.ResponseToolkit)=>
        //     {
        //       try{
        //           const dataBase=await request.getDb('InventoryManagementDatabase')
        //           const getTableData=dataBase.models.machines
        //           const getOrderTableData=dataBase.models.machineOrders
        //           const machineId=request.params.machineId
        //           const orderId=request.params.orderId 
                  
        //           const result=await getTableData.findOne({
        //             attributes: ['quantity','machineId'],
        //             where:{machineId:machineId},
        //            // group:['machineId']
        
        //           })
        //           console.log('ssassa',result)
        //           if(result!==null)
        //           {
        //             const result1=await getOrderTableData.findOne({
        //               attributes: ['quantity','machineId','orderId'],
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
        //                 return '0 product available'
        //               }
                       
        //             }
        //             else{
        //               return 'orderid not match'
        //             }
        //           }
        //           else{
        //             return 'not machineid available'
        //           }
        //         }
        //         catch(err){
        //           console.log(err)
        //         }
        //         },
        //           options:{
        //               validate:{
        //                   params:Joi.object({
        //                     machineId:Joi.number(),
        //                     orderId:Joi.number()
        //                   }),
        //                   // payload:Joi.object({
        //                   //   quantity:Joi.number()
        //                   // })
        
        //                 },
        //           description: "update quantity machine",
        //           notes: "Returns a todo item by the id passed in the path",
        //           tags: ["api"], // ADD THIS TAG
        //     }
        //   }
        // }
        // public updateMachinePrice(){
        //   return{
        //     method:"PUT",
        //     path:"/machine/updateMachinePrice/{machineId}/{orderId}",
        //     handler:async(request:any,h:Hapi.ResponseToolkit)=>
        //     {
        //       try{
        //           const dataBase=await request.getDb('InventoryManagementDatabase')
        //           const getTableData=dataBase.models.machines
        //           const getOrderTableData=dataBase.models.machineOrders
        //           const machineId=request.params.machineId
        //           const orderId=request.params.orderId
        //           const result=await getTableData.findOne({
              
        //             attributes: ['price','machineId'],
        //             where:{machineId:machineId},
                    
        //            // group:['machineId']
        
        //           })
        //           console.log('ssassa',result)
        //           if(result)
        //           {
        //             const result1=await getOrderTableData.findOne({
        //               attributes: ['orderId','machineId','quantity','priceDetails'],
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
        //                 return 'order id not available'
        //               }
                       
        //             }
                  
        //           else{
        //             return 'machine id found'
        //           }
        //         }
        //         catch(err){
        //           console.log(err)
        //         }
        //         },
        //           options:{
        //               validate:{
        //                   params:Joi.object({
        //                     machineId:Joi.number(),
        //                     orderId:Joi.number()
        //                   }),
        //                   // payload:Joi.object({
        //                   //   quantity:Joi.number()
        //                   // })
        
        //                 },
        //           description: "price machineOrders ",
        //           notes: "Returns a todo item by the id passed in the path",
        //           tags: ["api"], // ADD THIS TAG
        //     }
        //   }
        // }
      


