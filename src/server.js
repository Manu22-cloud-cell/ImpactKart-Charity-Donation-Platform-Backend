require("dotenv").config();
const app=require("./app");
const sequelize=require("./config/database");

const PORT=process.env.PORT;

(async()=>{
    try {
        await sequelize.authenticate();
        console.log("Database connected");

        await sequelize.sync({alter:false});
        console.log("Models synced");

        app.listen(PORT,()=>{ 
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("DB connection failed:", error.message);
    }
})();