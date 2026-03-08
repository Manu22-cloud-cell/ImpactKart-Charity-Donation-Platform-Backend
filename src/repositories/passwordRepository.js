const { User, ForgotPasswordRequest } = require("../models");

exports.findUserByEmail = (email) => {
    return User.findOne({ where: { email } });
};

exports.createResetRequest = (data) => {
    return ForgotPasswordRequest.create(data);
};

exports.findResetRequest = (uuid) => {
    return ForgotPasswordRequest.findOne({
        where: { id: uuid, isactive: true }
    });
};

exports.findUserById = (id) => {
    return User.findByPk(id);
};

exports.saveUser = (user) => {
    return user.save();
};

exports.saveResetRequest = (request) => {
    return request.save();
};