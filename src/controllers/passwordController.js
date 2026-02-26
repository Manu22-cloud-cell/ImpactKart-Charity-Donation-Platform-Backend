const { v4: uuidv4 } = require("uuid");
const { User, ForgotPasswordRequest } = require("../models");
const brevo = require("@getbrevo/brevo");

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(200).json({
                message: "If email exists, reset link sent"
            });
        }

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const request = await ForgotPasswordRequest.create({
            id: uuidv4(),
            UserId: user.id,
            expiresAt
        });

        // Send Email using Brevo
        const apiInstance = new brevo.TransactionalEmailsApi();

        apiInstance.setApiKey(
            brevo.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY,
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

        res.status(200).json({
            message: "Reset link sent, Please check your email"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to process request"
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { uuid, newPassword } = req.body;

        if (!uuid || !newPassword) {
            return res.status(400).json({
                message: "Invalid request"
            });
        }

        // Find forgot password request
        const forgotRequest = await ForgotPasswordRequest.findOne({
            where: { id: uuid, isactive: true }
        });

        if (!forgotRequest) {
            return res.status(400).json({
                message: "Link is invalid or already used"
            });
        }

        if (new Date() > forgotRequest.expiresAt) {
            return res.status(400).json({
                message: "Reset link expired"
            });
        }

        // Find user
        const user = await User.findByPk(forgotRequest.UserId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Update password
        user.password = newPassword;   // DO NOT HASH HERE
        await user.save();             // beforeUpdate hook will hash

        // Mark request as inactive
        forgotRequest.isactive = false;
        await forgotRequest.save();

        return res.status(200).json({
            message: "Password reset successful"
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};