const {DataTypes}=require("sequelize");
const sequelize=require("../config/database");
const bcrypt=require("bcryptjs");

const User=sequelize.define(
    "User",
    {
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true,
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        email:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true,
            validate: {
                isEmail:true
            },
        },
        phone:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true,
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        role:{
            type:DataTypes.ENUM("USER","CHARITY","ADMIN"),
            defaultValue:"USER"
        },
        profileImage: {
            type:DataTypes.STRING,
            allowNull:true,
        },
    },
    {
        tableName:"users",
        timestamps:true,
    }
);

//Hash password before saving
User.beforeCreate(async (user)=>{
    user.password=await bcrypt.hash(user.password,10);
});

//Hash password on update
User.beforeUpdate(async (user)=>{
    if(user.changed("password")) {
        user.password=await bcrypt.hash(user.password,10);
    }
});

module.exports=User;
