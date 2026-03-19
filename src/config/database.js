const { Sequelize } = require("sequelize");

console.log("DB CONFIG LOADED - DIALECT:", "mysql");

const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
});

module.exports = sequelize;