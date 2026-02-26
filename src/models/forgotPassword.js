const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
});

module.exports = ForgotPasswordRequest;