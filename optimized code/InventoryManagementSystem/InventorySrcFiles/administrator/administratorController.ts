import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";
import { Sequelize ,Op} from "sequelize";

export class administratorController{
        //add the Administrator
        public addNewAdministrator(){
            return{
                method: "POST",
                path: "/Administrator",
               handler: async function (request: any, h: Hapi.ResponseToolkit) {
                try {
                  //get the database 

                  const dataBase = request.getDb("softwareMachineDatabase")
                  //get the administrator table

                  const administratorTableData = dataBase.models.administrator;
                  
                 //check the email present or not
                 const checkData=await administratorTableData.findAll()
                 let isCheck=false
                 const filterData=checkData.filter((ele:any)=>{
                    if(ele.email==request.query.email ){
                      isCheck=true
                     }
                    else if(ele.phoneNo===request.query.phoneNo)
                {
                  isCheck=true
                  //return h.response('already phone registered')
                }
           
              })
              if(isCheck){
                 return h.response('already phone or email registered')
              }
              else{
                const getOutput =  administratorTableData.create(
                  request.query
                );
                return getOutput
              }
              
                   //add the employee
            }
         catch (err) {
                  console.log(err,'check details');
                }
              },
              options: {
                validate: {
                  //pass the data
                  query: Joi.object({
                    //adminId: Joi.number().min(1),
                    firstName: Joi.string().min(3).regex(/^([a-z]+\s)*[a-z]+$/).default('enter only alphabet').trim(),
                    lastName: Joi.string().min(3).regex(/^([a-z]+\s)*[a-z]+$/).default('enter only alphabet').trim(),
                    email: Joi.string().email().lowercase(),
                    password: Joi.string().min(4).max(40).trim().required(),
                    passwordConfirmation: Joi.string().required().meta({ disableDropdown: true }).valid(Joi.ref('password')),
                    phoneNo:Joi.string().regex(/^[0-9]{10}$/).default('Phone number must have 10 digits').required(),
                    securityQuestion: Joi.string().valid('enter your birth month').required(),
                    securityAnswer: Joi.string().required(),
                  }),
                },
               
                description: "Add administrator",
                notes: "Returns a todo item by the id passed in the path",
                tags: ["api"], // ADD THIS TAG
              },
            };
          }

          //get all admin detail
          public getAllAdministratorDetails() {
            return {
              method: "GET",
              path: "/Administrator",
              handler: async (request: any, h: Hapi.ResponseToolkit) => {
                try {
                  const dataBase = await request.getDb("softwareMachineDatabase");
                  const administratorTableData = dataBase.models.administrator;
                  //get all details
                  const getOutput=await administratorTableData.findAll();
            
                  if (getOutput.length>=1) {
                    console.log(getOutput);
                    return JSON.stringify(getOutput, null, 2);
                  } else {
                    return h.response('no administrator available');
                  }
                } catch (err) {
                  console.log(err);
                }
              },
              options: {
                description: "Find admin",
                notes: "Returns a todo item by the id passed in the path",
                tags: ["api"], // ADD THIS TAG
              },
            };
          }
          //update the information of administrator
          public updateAdministratorDetails() {
            return {
              method: "PUT",
              path: "/Administrator/{adminId}",
              handler: async (request: any, h: Hapi.ResponseToolkit) => {
                try {
                  const dataBase = await request.getDb("softwareMachineDatabase");
                  const administratorTableData = dataBase.models.administrator;
                const adminIds = request.params.adminId;
                //check first admin id present or not
                const getOutput = await administratorTableData.findOne({
                  where: { adminId: adminIds },
                });
                
                if (getOutput)//true
                 {
                  //update the data provided by query
                  getOutput.firstName=request.query.firstName,
                  getOutput.lastName=request.query.lastName,
                  getOutput.password=request.query.password,
                  getOutput.email=request.query.email,
                  getOutput.phoneNo=request.query.phoneNo,
                  getOutput.securityQuestion=request.query.securityQuestion,
                  getOutput.securityAnswer=request.query.securityAnswer,
  
                  await getOutput.save();
                  return JSON.stringify(getOutput, null, 2);
                } else {
                  return 'enter correct admin id'
                }
                }
              catch(err){
                console.log(err);
              }
              },
              options: {
                validate: {
                  params: Joi.object({
                    adminId: Joi.number(),
                  }),
                  query: Joi.object({
                    
                    firstName: Joi.string().min(3),
                    lastName: Joi.string().min(3),
                    email: Joi.string().email(),
                    password: Joi.string().min(4).max(40).trim().required(),
                    passwordConfirmation: Joi.string().required().meta({ disableDropdown: true }).valid(Joi.ref('password')),
                    phoneNo:Joi.string().regex(/^[0-9]{10}$/).default('Phone number must have 10 digits').required(),
                    securityQuestion: Joi.string().valid('enter your birth month').required(),
                    securityAnswer: Joi.string().required(),
                  }),
                },
                description: "Update admin",
                notes: "Returns a todo item by the id passed in the path",
                tags: ["api"], // ADD THIS TAG
              },
            };
          }
        //delete admin
          deleteAdministratorDetails() {
            return {
              method: "DELETE",
              path: "/Administrator/{adminId}",
              handler: async (request: any, h: Hapi.ResponseToolkit) => {
              
                  const dataBase = await request.getDb("softwareMachineDatabase");
                  const administratorTableData = dataBase.models.administrator;
                  const Id = request.params.adminId;
                 //delete Administrator using admin id
                const getOutput = await administratorTableData.destroy({
                  where: { adminId: Id },
                });
                if (getOutput) //admin id is correct
                {
                  return 'deleted'
                } 
                else {
                  return 'wrong admin id';
                }
              },
              options: {
                validate: {
                  params: Joi.object({
                    adminId: Joi.number()
                    
                  }),
                },
                description: "Delete admin",
                notes: "Returns a todo item by the id passed in the path",
                tags: ["api"], // ADD THIS TAG
              },
            };
          }
          //login Administrator
          public loginAdministrator(){
            return{
                method: "GET",
               path: "/login",
               handler: async function (request: any, h: Hapi.ResponseToolkit) {
                try {
                  const dataBase = request.getDb("softwareMachineDatabase");
                  const administratorTableData = dataBase.models.administrator;
                  const { email, password } =request.query;
                if(email!==undefined && password!==undefined)
                 {
                  const getOutput = await administratorTableData.findOne({
                    where:{
                      email:email 
                  }
                  });
                    if(getOutput)//email is correct
                    {
                      if(getOutput.password===password)//password is correct
                      {
                        return JSON.stringify(getOutput,null,2)//login 
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
                }    //check email and password present or not
                 
                } catch (err) {
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
               
                description: "login administrator",
                notes: "Returns a todo item by the id passed in the path",
                tags: ["api"], // ADD THIS TAG
              },
            };
          } 
          
          //forgot Administrator password
          public AdministratorForgotPassword(){
            return{
                method: "PUT",
               path: "/Administrator",
               handler: async function (request: any, h: Hapi.ResponseToolkit) {
                try {
                  const dataBase = request.getDb("softwareMachineDatabase");
                  const administratorTableData = dataBase.models.administrator;
                  const { securityAnswer, email ,password} =request.query;
          
                 const getOutput = await administratorTableData.findOne({ 
                  where: {email:email } 
               });
              
               if(getOutput)//email is correct
               {
                        //check securityAnswer are correct or not
                   if(getOutput.securityAnswer==securityAnswer)
                 {
                    getOutput.password=password // update the password
                    await getOutput.save()
                   return JSON.stringify(getOutput, null, 2);
                 }
                 else{
                   return 'wrong securityAnswer entered'
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
                    securityQuestion: Joi.string().default('enter your birth month'),
                    securityAnswer: Joi.string().required(),
                    password: Joi.string().min(4).max(40).trim().required(),
                    passwordConfirmation: Joi.string().required().meta({ disableDropdown: true }).valid(Joi.ref('password')),
  
                  }),
                },
               
                description: "update password",
                notes: "Returns a todo item by the id passed in the path",
                tags: ["api"], // ADD THIS TAG
              },
            };
          }  
          
}
