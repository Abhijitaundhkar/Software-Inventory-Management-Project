
import { DataTypes, Sequelize } from "sequelize/types";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  let User:any = sequelize.define(
    "employee",
     {
      employeeId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull: false,
        primaryKey: true,
      },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique:true
      },
      phoneNo: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique:true
      },
      securityQuestion:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      securityAnswer:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      },
    
    {
       createdAt: false,
      updatedAt: false,
      timestamps: false,
    },
    
    
  );


  User.associate=(model:any)=>{
    User.hasMany(model.orderData,{
        foreignKey:'employeeId',
        allowNull:true,
    
    })
  }

  return User;
};