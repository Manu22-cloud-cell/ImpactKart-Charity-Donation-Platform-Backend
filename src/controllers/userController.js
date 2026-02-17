const User = require("../models/user");
const Donation = require("../models/donation");
const Charity = require("../models/charity");
const bcrypt = require("bcryptjs");

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../utils/s3");

// =====================================
// GET USER PROFILE
// =====================================
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};

// =====================================
// GENERATE SIGNED S3 UPLOAD URL
// =====================================
exports.getProfileUploadUrl = async (req, res) => {
    try {

        const { fileType } = req.body;

        if (!fileType) {
            return res.status(400).json({
                message: "File type is required"
            });
        }

        // Allow only images
        if (!["image/jpeg", "image/png"].includes(fileType)) {
            return res.status(400).json({
                message: "Only JPG and PNG files are allowed"
            });
        }

        const fileExtension = fileType.split("/")[1];

        const fileName = `profile-${req.user.userId}-${Date.now()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 60, // 1 minute expiry
        });

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        res.json({
            signedUrl,
            fileUrl,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to generate upload URL"
        });
    }
};

// =====================================
// UPDATE USER PROFILE (NO FILE UPLOAD)
// =====================================
exports.updateProfile = async (req, res) => {
    try {

        const { name, phone, password, profileImage } = req.body;

        const user = await User.findByPk(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        // Save S3 image URL
        if (profileImage) {
            user.profileImage = profileImage;
        }

        // Hash password properly
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                name: user.name,
                phone: user.phone,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Profile update failed"
        });
    }
};

// =====================================
// USER DONATION HISTORY
// =====================================
exports.getDonationHistory = async (req, res) => {
    try {

        const donations = await Donation.findAll({
            where: {
                userId: req.user.userId,
            },
            include: [
                {
                    model: Charity,
                    attributes: ["id", "name", "category", "location"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({
            message: "Donation history fetched successfully",
            count: donations.length,
            donations,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch donation history",
        });
    }
};
