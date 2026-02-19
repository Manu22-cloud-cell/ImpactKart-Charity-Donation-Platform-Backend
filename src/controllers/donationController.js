const razorpay = require("../config/razorpay");
const Donation = require("../models/donation");
const crypto = require("crypto");
const User = require("../models/user");
const Charity = require("../models/charity");
const sequelize = require("../config/database");
const { sendDonationConfirmation } = require("../services/emailService");
const generateReceipt = require("../utils/generateDonationReceipt");

// CREATE DONATION ORDER
exports.createDonationOrder = async (req, res) => {
    try {
        const { amount, charityId } = req.body;

        if (!amount || !charityId) {
            return res.status(400).json({
                message: "Amount and charityId are required",
            });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100, // convert to paise
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
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create donation order",
        });
    }
};

// VERIFY PAYMENT
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
            return res.status(400).json({
                message: "Payment verification failed",
            });
        }

        // Fetch donation with relations
        const donation = await Donation.findByPk(donationId, {
            include: [User, Charity],
        });

        if (!donation) {
            return res.status(404).json({
                message: "Donation not found",
            });
        }

        // Prevent double processing
        if (donation.status === "SUCCESS") {
            return res.status(400).json({
                message: "Donation already processed",
            });
        }

        // TRANSACTION: update donation + charity amount
        await sequelize.transaction(async (t) => {
            // Update donation
            donation.paymentId = razorpay_payment_id;
            donation.status = "SUCCESS";
            await donation.save({ transaction: t });

            // Increment charity collected amount
            await Charity.increment(
                { collectedAmount: donation.amount / 100 },
                {
                    where: { id: donation.charityId },
                    transaction: t,
                }
            );
        });

        // Send confirmation email (non-blocking)
        try {
            await sendDonationConfirmation({
                to: donation.User.email,
                name: donation.User.name,
                amount: donation.amount / 100,
                charityName: donation.Charity.name,
                donation,
                user: donation.User,
                charity: donation.Charity,
            });

        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.json({
            success: true,
            message: "Donation successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Payment verification failed",
        });
    }
};

// GET MY DONATIONS
exports.getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.findAll({
            where: { userId: req.user.userId },
            include: [
                {
                    model: Charity,
                    attributes: ["id", "name", "category", "location"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        if (!donations) {
            return res.status(404).json({
                message: "Donation not found or unauthorized",
            });
        }

        const formattedDonations = donations.map(donation => ({
            id: donation.id,
            amount: donation.amount / 100, // paise → rupees
            currency: donation.currency,
            status: donation.status,
            paymentId: donation.paymentId,
            orderId: donation.orderId,
            donatedAt: donation.createdAt,
            charity: donation.Charity,
        }));

        res.json({
            count: formattedDonations.length,
            formattedDonations,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch donations",
        });
    }
};

// DOWNLOAD RECEIPT
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

        // Generate PDF buffer
        const pdfBuffer = await generateReceipt(
            donation,
            donation.User,
            donation.Charity
        );

        // Set correct headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=donation-receipt-${donation.id}.pdf`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        // Send PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to generate receipt",
        });
    }
};