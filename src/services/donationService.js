const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const sequelize = require("../config/database");

const donationRepo = require("../repositories/donationRepository");
const AppError = require("../utils/AppError");

const { sendDonationConfirmation } = require("./emailService");


// CREATE ORDER
exports.createDonationOrder = async (userId, data) => {

    const { amount, charityId } = data;

    if (!amount || !charityId) {
        throw new AppError("Amount and charityId are required", 400);
    }

    const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR"
    });

    const donation = await donationRepo.createDonation({
        amount: order.amount,
        orderId: order.id,
        userId,
        charityId,
        status: "PENDING"
    });

    return {
        order,
        donationId: donation.id
    };
};



// VERIFY PAYMENT
exports.verifyPayment = async (data) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        donationId
    } = data;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new AppError("Payment verification failed", 400);
    }

    const donation = await donationRepo.findDonationById(donationId);

    if (!donation) {
        throw new AppError("Donation not found", 404);
    }

    if (donation.status === "SUCCESS") {
        throw new AppError("Donation already processed", 400);
    }

    await sequelize.transaction(async (t) => {

        donation.paymentId = razorpay_payment_id;
        donation.status = "SUCCESS";

        await donationRepo.saveDonation(donation, t);

        await donationRepo.incrementCharityAmount(
            donation.charityId,
            donation.amount / 100,
            t
        );

    });

    // Send email (non-blocking)
    try {

        await sendDonationConfirmation({
            to: donation.User.email,
            name: donation.User.name,
            amount: donation.amount / 100,
            charityName: donation.Charity.name,
            donation,
            user: donation.User,
            charity: donation.Charity
        });

    } catch (emailError) {
        console.error("Email sending failed:", emailError);
    }

};



exports.getMyDonations = async (userId) => {

    const donations = await donationRepo.getUserDonations(userId);

    const formattedDonations = donations.map(donation => ({
        id: donation.id,
        amount: donation.amount / 100,
        currency: donation.currency,
        status: donation.status,
        paymentId: donation.paymentId,
        orderId: donation.orderId,
        donatedAt: donation.createdAt,
        charity: donation.Charity
    }));

    return {
        count: formattedDonations.length,
        formattedDonations
    };
};



exports.getDonationForReceipt = async (donationId, userId) => {

    const donation = await donationRepo.findDonationForReceipt(
        donationId,
        userId
    );

    if (!donation) {
        throw new AppError("Donation not found or unauthorized", 404);
    }

    return donation;
};