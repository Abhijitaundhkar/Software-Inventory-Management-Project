import { any } from "joi";
import { DataTypes, Sequelize } from "sequelize/types";



module.exports = (sequelize: Sequelize, DataTypes: any) => {
  let admin:any = sequelize.define(
    "administrator",
    {
      adminId: {
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
      securityQuestion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      securityAnswer: {
        type: DataTypes.STRING,
        allowNull: false,
    
      },
      

    },
    {
      indexes: [
        {
            
            unique: true,
            fields: ['email', 'phoneNo']
        }
    ],
      createdAt: false,
      updatedAt: false,
      timestamps: false,
    },
    
    
  );


  

  return admin;
};