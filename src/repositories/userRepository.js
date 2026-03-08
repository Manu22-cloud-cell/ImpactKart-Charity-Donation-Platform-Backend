const User = require("../models/user");

exports.findUserById = async (userId) => {
    return User.findByPk(userId, {
        attributes: { exclude: ["password"] }
    });
};

exports.findUserByIdWithPassword = async (userId) => {
    return User.findByPk(userId);
};

exports.saveUser = async (user) => {
    return user.save();
};