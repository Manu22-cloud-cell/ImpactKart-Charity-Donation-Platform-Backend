const userService = require("../services/userService");
const asyncHandler = require("../middlewares/asyncHandler");

// GET USER PROFILE
exports.getProfile = asyncHandler(async (req, res) => {

    const user = await userService.getUserProfile(req.user.userId);

    res.json({
        message: "Profile fetched successfully",
        user
    });

});


// GENERATE S3 UPLOAD URL
exports.getProfileUploadUrl = asyncHandler(async (req, res) => {

    const { fileType } = req.body;

    const result = await userService.generateProfileUploadUrl(
        req.user.userId,
        fileType
    );

    res.json(result);

});


// UPDATE PROFILE
exports.updateProfile = asyncHandler(async (req, res) => {

    const updatedUser = await userService.updateUserProfile(
        req.user.userId,
        req.body
    );

    res.json({
        message: "Profile updated successfully",
        user: updatedUser
    });

});


// DONATION HISTORY
exports.getDonationHistory = asyncHandler(async (req, res) => {

    const result = await userService.getUserDonationHistory(
        req.user.userId
    );

    res.json({
        message: "Donation history fetched successfully",
        ...result
    });

});