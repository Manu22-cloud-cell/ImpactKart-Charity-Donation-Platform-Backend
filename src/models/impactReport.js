const {DataTypes}=require("sequelize");
const sequelize=require("../config/database");

const ImpactReport=sequelize.define(
    "ImpactReport",
    {
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
        },
        title:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        description: {
            type:DataTypes.STRING,
            allowNull:false,
        },
        images: {
            type:DataTypes.JSON, //array of image URLs
            allowNull:true,
        },
    },
    {
        tableName:"impact_reports",
        timestamps:true,
    }
);
 module.exports=ImpactReport;