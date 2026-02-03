const razorpay = require("../config/razorpay");
const Donation = require("../models/donation");
const crypto = require("crypto");
const User = require("../models/user");
const Charity = require("../models/charity");
const { sendDonationConfirmation } = require("../services/emailService");
const generateReceipt = require("../utils/generateDonationReceipt");

exports.createDonationOrder = async (req, res) => {
    try {
        const { amount, charityId } = req.body;

        const order = await razorpay.orders.create({
            amount: amount * 100, //covert to paise
            currency: "INR",
        });

        const donation = await Donation.create({
            amount: order.amount,
            orderId: order.id,
            userId: req.user.userId,
            charityId: charityId,
            status: "PENDING",
        });

        res.status(201).json({
            success: true,
            order,
            donationId: donation.id,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            donationId,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        await Donation.update(
            {
                paymentId: razorpay_payment_id,
                status: "SUCCESS",
            },
            { where: { id: donationId } }
        );

        //Fetch donation with relations(for email data)
        const donation = await Donation.findByPk(donationId, {
            include: [User, Charity],
        });

        //Send confirmation email(non-blocking)
        try {
            await sendDonationConfirmation({
                to: donation.User.email,
                name: donation.User.name,
                amount: donation.amount / 100, // paise -> rupees
                charityName: donation.Charity.name,
            })
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

        res.json({ success: true, message: "Donation successful" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMyDonations = async (req, res) => {
    const donations = await Donation.findAll({
        where: { userId: req.user.userId },
        include: ["Charity"],
    });

    res.json(donations);
}

exports.downloadReceipt = async (req, res) => {
    try {
        const donationId = req.params.id;

        const donation = await Donation.findOne({
            where: {
                id: donationId,
                userId: req.user.userId,
                status: "SUCCESS",
            },
            include: [User, Charity],
        });

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found or unauthorized",
            });
        }

        generateReceipt(
            donation,
            donation.User,
            donation.Charity,
            res
        );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to generate receipt",
        });
    }
};



