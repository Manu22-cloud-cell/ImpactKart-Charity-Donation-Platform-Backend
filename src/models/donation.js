const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Donation = sequelize.define(
    "Donation",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
        },
        amount:{
            type:DataTypes.INTEGER, // store in paise
            allowNull:false,
        },
        currency:{
            type:DataTypes.STRING,
            defaultValue:"INR",
        },
        paymentId:{
            type:DataTypes.STRING,
            allowNull:true,
        },
        orderId: {
            type:DataTypes.STRING,
            allowNull:true,
        },
        status:{
            type:DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
            defaultValue:"PENDING",
        },
    },
    {
        tableName:"donations",
        timestamps:true,
    }
);

module.exports=Donation;
