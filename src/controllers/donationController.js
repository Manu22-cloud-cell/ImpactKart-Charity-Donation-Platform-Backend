const asyncHandler = require("../middlewares/asyncHandler");
const donationService = require("../services/donationService");
const generateReceipt = require("../utils/generateDonationReceipt");


// CREATE ORDER
exports.createDonationOrder = asyncHandler(async (req, res) => {

    const result = await donationService.createDonationOrder(
        req.user.userId,
        req.body
    );

    res.status(201).json({
        success: true,
        order: result.order,
        donationId: result.donationId
    });

});



// VERIFY PAYMENT
exports.verifyPayment = asyncHandler(async (req, res) => {

    await donationService.verifyPayment(req.body);

    res.json({
        success: true,
        message: "Donation successful"
    });

});



// GET MY DONATIONS
exports.getMyDonations = asyncHandler(async (req, res) => {

    const result = await donationService.getMyDonations(
        req.user.userId
    );

    res.json(result);

});



// DOWNLOAD RECEIPT
exports.downloadReceipt = asyncHandler(async (req, res) => {

    const donation = await donationService.getDonationForReceipt(
        req.params.id,
        req.user.userId
    );

    const pdfBuffer = await generateReceipt(
        donation,
        donation.User,
        donation.Charity
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=donation-receipt-${donation.id}.pdf`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);

});