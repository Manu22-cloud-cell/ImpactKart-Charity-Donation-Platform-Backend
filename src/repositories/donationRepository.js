const Donation = require("../models/donation");
const Charity = require("../models/charity");
const User = require("../models/user");

exports.getUserDonations = async (userId) => {
    return Donation.findAll({
        where: { userId },
        include: [
            {
                model: Charity,
                attributes: ["id", "name", "category", "location"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

exports.createDonation = (data) => {
    return Donation.create(data);
};

exports.findDonationById = (id) => {
    return Donation.findByPk(id, {
        include: [User, Charity]
    });
};

exports.getUserDonations = (userId) => {
    return Donation.findAll({
        where: { userId },
        include: [
            {
                model: Charity,
                attributes: ["id", "name", "category", "location"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

exports.findDonationForReceipt = (donationId, userId) => {
    return Donation.findOne({
        where: {
            id: donationId,
            userId,
            status: "SUCCESS"
        },
        include: [User, Charity]
    });
};

exports.saveDonation = (donation, transaction) => {
    return donation.save({ transaction });
};

exports.incrementCharityAmount = (charityId, amount, transaction) => {
    return Charity.increment(
        { collectedAmount: amount },
        {
            where: { id: charityId },
            transaction
        }
    );
};