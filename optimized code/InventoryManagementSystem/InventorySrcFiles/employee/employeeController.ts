import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";

export class employeeController{
          // add new employee to database
           public addNewEmployee(){
              return{
              method: "POST",
              path: "/employees",
              handler: async function (request:any, h: Hapi.ResponseToolkit) {
               try{
                 //get the database 
                 const dataBase = request.getDb("softwareMachineDatabase");
                  //get the employee table
                 const employeeTableData = dataBase.models.employee;
                 //  get all data from table
                 const findData=await employeeTableData.findAll()
               let isTemp=true 
               //find the data is present or not
                for(let i of findData){
               if(i.email===request.query.email)//check email no repeat or not
               {
                isTemp=false
                return h.response('already email id registered')
             
                }
                 else if(i.phoneNo===request.query.phoneNo)//check phone no repeat or not
                {
                  isTemp=false
                  return h.response('already phone number registered')
                }
              }
            if(isTemp==true){
              //add the employee
              const getOutput = await employeeTableData.create(
                request.query
              );
              if(getOutput){
                return JSON.stringify(getOutput, null, 2);
              }
              else{
                return 'employee are not added'
              }
            }
          }
                catch(err){
                  console.log(err)
                }
               
             },
             options: {
               validate: {
                query: Joi.object({
                  //adminId: Joi.number().min(1),
                  firstName: Joi.string().min(3).regex(/^([a-z]+\s)*[a-z]+$/).default('enter only alphabet').trim(),
                  lastName: Joi.string().min(3).regex(/^([a-z]+\s)*[a-z]+$/).default('enter only alphabet').trim(),
                  email: Joi.string().email().lowercase(),
                  password: Joi.string().min(4).max(40).trim().required(),
                  passwordConfirmation: Joi.string().required().meta({ disableDropdown: true }).valid(Joi.ref('password')),
                  phoneNo:Joi.string().regex(/^[0-9]{10}$/).default('Phone number must have 10 digits').required(),
                  securityQuestion: Joi.string().valid('what is your nick name','what is your favorite fruit').required(),
                  securityAnswer: Joi.string().required()
                }),
               },
               description: "Add employee",
               notes: "Returns a todo item by the id passed in the path",
               tags: ["api"], // ADD THIS TAG
             },
           };
         }
      // get all employee details
         public getAllEmployeeDetails() {
          return {
            method: "GET",
            path: "/employees",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("softwareMachineDatabase");
                const employeeTableData = dataBase.models.employee;
                //find all data
                const result=await employeeTableData.findAll();
                if (result.length>=1) {
                  //convert object to json string
                    return JSON.stringify(result, null, 2);
                   }
                   else{
                     return h.response('no employee present')
                   }
              } catch (err) {
                console.log(err);
              }
            },
            options: {
            
              description: "Find employee",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public updateEmployeeDetails() {
          return {
            method: "PUT",
            path: "/employees/{employeeId}",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              try {
                const dataBase = await request.getDb("softwareMachineDatabase");
                const employeeTableData = dataBase.models.employee;
               const searchId = request.params.employeeId;
              //find employee details
              const result = await employeeTableData.findOne({
                where: { employeeId: searchId },
              });
             
              if (result) {
                //update the details
                result.firstName=request.query.firstName,
                result.lastName=request.query.lastName,
                result.password=request.query.password,
                result.email=request.query.email,
                result.phoneNo=request.query.phoneNo,
                result.securityQuestion=request.query.securityQuestion,
                result.securityAnswer=request.query.securityAnswer,
                
                await result.save();
                return JSON.stringify(result, null, 2);
              } else {
                return "wrong employee id";
              }
            }
            catch(err){
              console.log(err);
            }
            },
            options: {
              validate: {
                params: Joi.object({
                  employeeId: Joi.string(),
                }),
                query: Joi.object({
                 // employeeId: Joi.number().min(1),
                 firstName: Joi.string().min(3),
                 lastName: Joi.string().min(3),
                 email: Joi.string().email(),
                 password: Joi.string().min(4).max(40).trim().required(),
                 passwordConfirmation: Joi.string().required().meta({ disableDropdown: true }).valid(Joi.ref('password')),
                 phoneNo:Joi.string().regex(/^[0-9]{10}$/).default('Phone number must have 10 digits').required(),
                 securityQuestion: Joi.string().valid('what is your nick name','what is your favorite fruit').required(),
                 securityAnswer: Joi.string().required()
               }),
              },
              description: "Update employee",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
      
        deleteEmployeeDetails() {
          return {
            method: "DELETE",
            path: "/employees/{employeeId}",
            handler: async (request: any, h: Hapi.ResponseToolkit) => {
              // try {
                const dataBase = await request.getDb("softwareMachineDatabase");
                const employeeTableData = dataBase.models.employee;
                const searchId = request.params.employeeId;
              //delete employee data
               const result = await employeeTableData.destroy({
                where: { employeeId: searchId },
              });
              if (result) {
                return 'deleted'
              } else {
                return  'wrong employee id '
              }
            },
            options: {
              validate: {
                params: Joi.object({
                  employeeId:Joi.number()
                }),
              },
              description: "Delete employee",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }
        public loginEmployee(){
          return{
              method: "GET",
             path: "/login",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("softwareMachineDatabase");
                const employeeTableData = dataBase.models.employee;
                const { email, password } =request.query;
               
               if(email!==undefined && password!==undefined)
               {
                 //check email and other details are correct or not  
                const getOutput = await employeeTableData.findOne({
                  where:{
                    email:email
                  
                }
                });
                  if(getOutput)//email is correct
                  {
                    if(getOutput.password===password)//password is correct
                    {
                      return JSON.stringify(getOutput,null,2)
                      }
                   else{
                 
                      return 'wrong password '
                      }
                    }
                  
                  else{
                    
                    return 'wrong email entered or create new account if you dont have an account'
                  }
                
              }
              else{
                return h.response('enter data')
              }
            }
            catch (err) {
                console.log(err);
              }
            },
            options: {
              validate: {
                query: Joi.object({
                  //adminId: Joi.number().min(1),
                  email: Joi.string(),
                  password: Joi.string(),
                  
      
                }),
              },
             
              description: "login employee",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }     
        public employeeForgotPassword(){
          return{
              method: "PUT",
             path: "/employees",
             handler: async function (request: any, h: Hapi.ResponseToolkit) {
              try {
                const dataBase = request.getDb("softwareMachineDatabase");
                const employeeTableData = dataBase.models.employee;
                const {securityQuestion, securityAnswer, password ,email} =request.query;
               //check email securityQuestion,securityAnswer is correct or not
                const getOutput = await employeeTableData.findOne({ 
                   where: {email:email } 
                });
        
                if(getOutput)//email is correct
                {
                  if(getOutput.securityQuestion==securityQuestion)//securityQuestion is correct or not
                  {
                    if(getOutput.securityAnswer==securityAnswer)//securityAnswer is correct or not
                  {
                     getOutput.password=password //update password
                     await getOutput.save()
                    return JSON.stringify(getOutput, null, 2);
                  }
                  else{
                    return 'wrong securityAnswer entered'
                  }
                }
                else{
                  'wrong securityQuestion  entered'

                }
                }
                else {
                  return  'wrong email entered'
                }
                
              } catch (err) {
                console.log(err);
              }
            },
            options: {
              validate: {
                query: Joi.object({
                  email:Joi.string().email().required(),
                  securityQuestion: Joi.string().valid('what is your nick name','what is your favorite fruit').required(),
                  securityAnswer: Joi.string().required(),
                  password: Joi.string().min(4).max(40).trim().required(),
                  passwordConfirmation: Joi.string().required().meta({ disableDropdown: true }).valid(Joi.ref('password')),
        
                }),
      
              },
             
              description: "update employee password",
              notes: "Returns a todo item by the id passed in the path",
              tags: ["api"], // ADD THIS TAG
            },
          };
        }  

      }






        //     public addEmployee2(){
        //       return{
        //       method: "POST",
        //       path: "/addEmployee2/signup",
        //       handler: async function (request:any, h: Hapi.ResponseToolkit) {
        //        try{
        //          //get the database 
        //          const dataBase = request.getDb("softwareMachineDatabase");
        //           //get the employee table
        //          const employeeTableData = dataBase.models.employee;
        //          //  get all data from table
        //          const findData=await employeeTableData.findOrCreate({
        //            where:{email:request.query.email,phoneNo:request.query.phoneNo},
        //            defaults: {
        //             firstName:request.query.firstName,
        //             lastName:request.query.lastName,
        //             email:request.query.email,
        //             password:request.query.password,
        //             phoneNo:request.query.phoneNo,
        //             securityQuestion:request.query.firstName,
        //             securityAnswer:request.query.firstName,
                    
        //           }
        //          })
        //          if(findData){

        //           return JSON.stringify(findData,null,2)
        //          }
        //          else{
        //            return 'already data present'
        //          }
        //       }
          
        //         catch(err){
        //           console.log(err)
        //         }
               
        //      },
        //      options: {
        //        validate: {
        //         query: Joi.object({
        //           //adminId: Joi.number().min(1),

        //           firstName: Joi.string().min(3).regex(/^([a-z]+\s)*[a-z]+$/).default('enter only alphabet').trim(),
        //           lastName: Joi.string().min(3).regex(/^([a-z]+\s)*[a-z]+$/).default('enter only alphabet').trim(),
        //           email: Joi.string().email().lowercase(),
        //           password: Joi.string().min(4).max(40).trim().required(),
        //           passwordConfirmation: Joi.string().required().meta({ disableDropdown: true }).valid(Joi.ref('password')),
        //           phoneNo:Joi.string().regex(/^[0-9]{10}$/).default('Phone number must have 10 digits').required(),
        //           securityQuestion: Joi.string().valid('what is you nick name','what is your favorite fruit').required(),
        //           securityAnswer: Joi.string().required()
        //         }),
        //        },
        //        description: "Add employee2",
        //        notes: "Returns a todo item by the id passed in the path",
        //        tags: ["api"], // ADD THIS TAG
        //      },
        //    };
        //  }

        
