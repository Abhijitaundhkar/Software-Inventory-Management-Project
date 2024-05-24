import { DataTypes, Sequelize } from "sequelize/types";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
  let softwares:any = sequelize.define(
    "product",
    {
      productId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull: false,
        primaryKey: true,
      },
      productType:{
        type: DataTypes.STRING,
        allowNull: false
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false,

      },
    
      description:{
        type: DataTypes.STRING(1234),
        allowNull: false,
        
      },

      price:{
        type: DataTypes.INTEGER,
        allowNull: false,
        
      },
      quantity:{
        type: DataTypes.INTEGER,
        allowNull: false,
        
      },
      imagePath:{
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

  softwares.associate=(model:any)=>{
    softwares.hasMany(model.orderData,{
        foreignKey:'productId',
        allowNull:true,
    
    })
  }
  return softwares;
};