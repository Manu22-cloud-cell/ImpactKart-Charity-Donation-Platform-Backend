const User = require("../models/user");
const { Op } = require("sequelize");

exports.findUserByEmail = async (email) => {
    return User.findOne({
        where: { email }
    });
};

exports.findUserByLoginId = async (loginId) => {
    return User.findOne({
        where: {
            [Op.or]: [{ email: loginId }, { phone: loginId }]
        }
    });
};

exports.createUser = async (data) => {
    return User.create(data);
};