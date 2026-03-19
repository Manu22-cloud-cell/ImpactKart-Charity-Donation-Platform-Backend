const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: false,
    }
);

console.log("DB CONFIG LOADED - DIALECT:", "mysql");

console.log("ENV DEBUG:", {
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? "SET" : "MISSING",
    DB_HOST: process.env.DB_HOST,
});

module.exports = sequelize;