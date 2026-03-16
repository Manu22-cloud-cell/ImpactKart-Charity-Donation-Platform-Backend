const { Charity, User, Donation } = require("../models");

// CHARITIES

exports.getAllCharities = () => {
    return Charity.findAll();
};

exports.getPendingCharities = (limit, offset) => {
    return Charity.findAndCountAll({
        where: { status: "PENDING" },
        include: {
            model: User,
            attributes: ["id", "name", "email", "phone"]
        },
        limit,
        offset,
        order: [["createdAt", "DESC"]]
    });
};

exports.findCharityById = (id) => {
    return Charity.findByPk(id);
};

exports.findCharityWithUser = (id) => {
    return Charity.findByPk(id, { include: User });
};

exports.saveCharity = (charity) => {
    return charity.save();
};

// USERS

exports.getAllUsers = (limit, offset) => {
    return User.findAndCountAll({
        where: { role: ["USER", "CHARITY"] },
        attributes: { exclude: ["password"] },
        limit,
        offset,
        order: [["createdAt", "DESC"]]
    });
};

exports.findUserById = (id) => {
    return User.findByPk(id);
};

exports.saveUser = (user) => {
    return user.save();
};

// DONATIONS

exports.getAllDonations = (limit, offset) => {
    return Donation.findAndCountAll({
        include: [
            { model: User, attributes: ["name", "email"] },
            { model: Charity, attributes: ["name"] }
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]]
    });
};