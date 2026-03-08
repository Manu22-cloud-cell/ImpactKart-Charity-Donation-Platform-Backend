const asyncHandler = require("../middlewares/asyncHandler");
const passwordService = require("../services/passwordService");


// FORGOT PASSWORD
exports.forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    await passwordService.forgotPassword(email);

    res.status(200).json({
        message: "Reset link sent, Please check your email"
    });

});


// RESET PASSWORD
exports.resetPassword = asyncHandler(async (req, res) => {

    const { uuid, newPassword } = req.body;

    await passwordService.resetPassword(uuid, newPassword);

    res.status(200).json({
        message: "Password reset successful"
    });

});