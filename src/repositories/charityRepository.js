const { Charity, User } = require("../models");
const { Op } = require("sequelize");

exports.findCharityByCreator = (userId) => {
    return Charity.findOne({
        where: { createdBy: userId }
    });
};

exports.findCharityByCreatorWithUser = (userId) => {
    return Charity.findOne({
        where: { createdBy: userId },
        include: {
            model: User,
            attributes: ["name", "email"]
        }
    });
};

exports.createCharity = (data) => {
    return Charity.create(data);
};

exports.updateUserRole = (userId, role) => {
    return User.update(
        { role },
        { where: { id: userId } }
    );
};

exports.updateCharity = (charity, data) => {
    return charity.update(data);
};

exports.deleteCharity = (charity) => {
    return charity.destroy();
};

exports.getApprovedCharities = (where, limit, offset) => {
    return Charity.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        attributes: { exclude: ["createdBy"] }
    });
};

exports.findCharityById = (id) => {
    return Charity.findByPk(id);
};