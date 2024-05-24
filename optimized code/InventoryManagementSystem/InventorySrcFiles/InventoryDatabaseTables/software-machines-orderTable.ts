
import { DataTypes, Sequelize } from "sequelize/types";
module.exports = (sequelize: Sequelize, DataTypes:any) => {
  let order:any = sequelize.define(
    "orderData",
     {
      orderId: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
        allowNull: false,
        primaryKey: true,
      },
        employeeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      quantity:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      priceDetails:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date:{
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      },
    
    {
       createdAt: 'date',
      updatedAt: false,
      timestamps: false,
      
    },
    
    
  )

 order.associate=(model:any)=>{
  model.order.belongsToMany(model.product,{
     foreignKey:'productId',

   })
 
        }    

        order.associate=(model:any)=>{
           order.belongsTo(model.employee,{
             foreignKey:'employeeId',
             
        
           })
          }
        
         

  return order
    }