const { Sequelize } = require("sequelize");

console.log("DB CONFIG LOADED");

const sequelize = new Sequelize(
    `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:3306/${process.env.DB_NAME}`,
    {
        dialect: "mysql",
        logging: false,
    }
);

module.exports = sequelize;