const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Charity = sequelize.define(
    "Charity",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        goalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        collectedAmount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
            defaultValue: "PENDING"
        }
    },
    {
        tableName: "charities",
        timestamps: true
    }
);

module.exports = Charity;