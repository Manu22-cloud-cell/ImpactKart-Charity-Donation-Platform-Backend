const { v4: uuidv4 } = require("uuid");
const brevo = require("@getbrevo/brevo");

const passwordRepo = require("../repositories/passwordRepository");
const AppError = require("../utils/AppError");


// FORGOT PASSWORD
exports.forgotPassword = async (email) => {

    const user = await passwordRepo.findUserByEmail(email);

    if (!user) {
        return; // intentionally silent
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const request = await passwordRepo.createResetRequest({
        id: uuidv4(),
        UserId: user.id,
        expiresAt
    });

    const apiInstance = new brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
    );

    await apiInstance.sendTransacEmail({
        sender: { email: "manojkymanu6@gmail.com" },
        to: [{ email }],
        subject: "ImpactKart Password Reset",
        htmlContent: `
            <p>Click below to reset password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password.html?id=${request.id}">
                Reset Password
            </a>
        `
    });

};



// RESET PASSWORD
exports.resetPassword = async (uuid, newPassword) => {

    if (!uuid || !newPassword) {
        throw new AppError("Invalid request", 400);
    }

    const forgotRequest = await passwordRepo.findResetRequest(uuid);

    if (!forgotRequest) {
        throw new AppError("Link is invalid or already used", 400);
    }

    if (new Date() > forgotRequest.expiresAt) {
        throw new AppError("Reset link expired", 400);
    }

    const user = await passwordRepo.findUserById(forgotRequest.UserId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.password = newPassword;
    await passwordRepo.saveUser(user);

    forgotRequest.isactive = false;
    await passwordRepo.saveResetRequest(forgotRequest);

};