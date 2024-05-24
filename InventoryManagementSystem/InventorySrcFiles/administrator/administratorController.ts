import * as Hapi from "@hapi/hapi";
import * as Joi from "joi";

export class administratorController {
  //add the Administrator
  public addNewAdministrator() {
    return {
      method: "POST",
      path: "/addNewAdministrator/signup",
      handler: async function (request: any, h: Hapi.ResponseToolkit) {
        try {
          //get the database
          const dataBase = request.getDb("InventoryManagementDatabase");
          //get the administrator table
          const administratorTableData = dataBase.models.administrator;
          //check the email present or not
          const getTableData = await administratorTableData.findAll();
          let isTemp = true;
          //find the data is present or not
          for (let i of getTableData) {
            if (i.email === request.payload.email) {
              isTemp = false;
              return h.response("already email id registered");
            } else if (i.phoneNo === request.payload.phoneNo) {
              isTemp = false;
              return h.response("already phone number registered");
            }
          }
          if (isTemp == true) {
            //add the employee
            const getOutput = await administratorTableData.create(
              request.payload
            );
            //if admin added
            if (getOutput) {
              return JSON.stringify(getOutput, null, 2);
            } else {
              return "no admin added";
            }
          }
        } catch (err) {
          console.log(err, "check details");
        }
      },
      options: {
        validate: {
          //pass the data
          payload: Joi.object({
            //adminId: Joi.number().min(1),
            firstName: Joi.string()
              .min(3)
              .regex(/^([a-z]+\s)*[a-z]+$/)
              .default("enter only alphabet")
              .trim(),
            lastName: Joi.string()
              .min(3)
              .regex(/^([a-z]+\s)*[a-z]+$/)
              .default("enter only alphabet")
              .trim(),
            email: Joi.string().email(),
            password: Joi.string().min(4).max(40).trim().required(),
            passwordConfirmation: Joi.string()
              .required()
              .meta({ disableDropdown: true })
              .valid(Joi.ref("password")),
            phoneNo: Joi.string()
              .regex(/^[0-9]{10}$/)
              .default("Phone number must have 10 digits")
              .required(),
            securityQuestion: Joi.string()
              .valid("enter your pet name")
              .required(),
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
      path: "/getAllAdministratorDetails",
      handler: async (request: any, h: Hapi.ResponseToolkit) => {
        try {
          const dataBase = await request.getDb("InventoryManagementDatabase");
          const administratorTableData = dataBase.models.administrator;
          //get all details
          const getOutput = await administratorTableData.findAll();

          if (getOutput.length >= 1) {
            console.log(getOutput);
            return JSON.stringify(getOutput, null, 2);
          } else {
            return h.response("no administrator available");
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
      path: "/updateAdministratorDetails/{adminId}",
      handler: async (request: any, h: Hapi.ResponseToolkit) => {
        try {
          const dataBase = await request.getDb("InventoryManagementDatabase");
          const administratorTableData = dataBase.models.administrator;
          const adminIds = request.params.adminId;
          //check first admin id present or not
          const getOutput = await administratorTableData.findOne({
            where: { adminId: adminIds },
          });

          if (getOutput) {
            //true
            //update the data
            (getOutput.firstName = request.query.firstName),
              (getOutput.lastName = request.query.lastName),
              (getOutput.password = request.query.password),
              (getOutput.email = request.query.email),
              (getOutput.phoneNo = request.query.phoneNo),
              (getOutput.securityQuestion = request.query.securityQuestion),
              (getOutput.securityAnswer = request.query.securityAnswer),
              await getOutput.save();
            return JSON.stringify(getOutput, null, 2);
          } else {
            return "enter correct admin id";
          }
        } catch (err) {
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
            passwordConfirmation: Joi.string()
              .required()
              .meta({ disableDropdown: true })
              .valid(Joi.ref("password")),
            phoneNo: Joi.string()
              .regex(/^[0-9]{10}$/)
              .default("Phone number must have 10 digits")
              .required(),
            securityQuestion: Joi.string()
              .valid("enter your pet name")
              .required(),
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
      path: "/deleteAdministratorDetails/{adminId}",
      handler: async (request: any, h: Hapi.ResponseToolkit) => {
        const dataBase = await request.getDb("InventoryManagementDatabase");
        const administratorTableData = dataBase.models.administrator;
        const Id = request.params.adminId;
        //delete Administrator using admin id
        const getOutput = await administratorTableData.destroy({
          where: { adminId: Id },
        });
        if (getOutput) {
          //admin id is correct
          return "deleted";
        } else {
          return "wrong admin id";
        }
      },
      options: {
        validate: {
          params: Joi.object({
            adminId: Joi.number(),
          }),
        },
        description: "Delete admin",
        notes: "Returns a todo item by the id passed in the path",
        tags: ["api"], // ADD THIS TAG
      },
    };
  }
  //login Administrator
  public loginAdministrator() {
    return {
      method: "POST",
      path: "/loginAdministrator",
      handler: async function (request: any, h: Hapi.ResponseToolkit) {
        try {
          const dataBase = request.getDb("InventoryManagementDatabase");
          const administratorTableData = dataBase.models.administrator;

          const { email, password } = request.query;
          //check email and password present or not
          if (email !== undefined && password !== undefined) {
            const getOutput = await administratorTableData.findOne({
              where: {
                email: email,
              },
            });
            if (getOutput) {
              //email is correct
              if (getOutput.password === password) {
                //password is correct
                return JSON.stringify(getOutput, null, 2); //login
              } else {
                return "wrong password ";
              }
            } else {
              return "wrong email entered or create new account if you dont have an account";
            }
          } else {
            return h.response("enter data");
          }
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
  public AdministratorForgotPassword() {
    return {
      method: "PUT",
      path: "/AdministratorForgotPassword",
      handler: async function (request: any, h: Hapi.ResponseToolkit) {
        try {
          const dataBase = request.getDb("InventoryManagementDatabase");

          const administratorTableData = dataBase.models.administrator;

          const { securityAnswer, email, password } = request.query;
          //check securityQuestion and securityAnswer are correct or not
          const getOutput = await administratorTableData.findOne({
            where: { email: email },
          });

          if (getOutput) {
            //email is correct
            //check securityAnswer are correct or not
            if (getOutput.securityAnswer == securityAnswer) {
              getOutput.password = password; // update the password
              await getOutput.save();
              return JSON.stringify(getOutput, null, 2);
            } else {
              return "wrong securityAnswer entered";
            }
          } else {
            return "wrong email entered";
          }
        } catch (err) {
          console.log(err);
        }
      },
      options: {
        validate: {
          query: Joi.object({
            email: Joi.string().email().required(),
            securityQuestion: Joi.string().default("enter your pet name"),
            securityAnswer: Joi.string().required(),
            password: Joi.string().min(4).max(40).trim().required(),
            passwordConfirmation: Joi.string()
              .required()
              .meta({ disableDropdown: true })
              .valid(Joi.ref("password")),
          }),
        },

        description: "update password",
        notes: "Returns a todo item by the id passed in the path",
        tags: ["api"], // ADD THIS TAG
      },
    };
  }
}
