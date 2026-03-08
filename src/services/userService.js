const bcrypt = require("bcryptjs");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = require("../utils/s3");
const AppError = require("../utils/AppError");

const userRepository = require("../repositories/userRepository");
const donationRepository = require("../repositories/donationRepository");

// GET USER PROFILE

exports.getUserProfile = async (userId) => {

    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};



// GENERATE SIGNED S3 URL

exports.generateProfileUploadUrl = async (userId, fileType) => {

    if (!fileType) {
        throw new AppError("File type is required", 400);
    }

    if (!["image/jpeg", "image/png"].includes(fileType)) {
        throw new AppError("Only JPG and PNG files are allowed", 400);
    }

    const fileExtension = fileType.split("/")[1];

    const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 60,
    });

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return { signedUrl, fileUrl };
};



// UPDATE PROFILE

exports.updateUserProfile = async (userId, data) => {

    const { name, phone, password, profileImage } = data;

    const user = await userRepository.findUserByIdWithPassword(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
    }

    await userRepository.saveUser(user);

    return {
        name: user.name,
        phone: user.phone,
        profileImage: user.profileImage
    };
};



// DONATION HISTORY

exports.getUserDonationHistory = async (userId) => {

    const donations = await donationRepository.getUserDonations(userId);

    return {
        count: donations.length,
        donations
    };
};