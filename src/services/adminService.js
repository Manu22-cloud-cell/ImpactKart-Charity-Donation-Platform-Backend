const adminRepo = require("../repositories/adminRepository");
const AppError = require("../utils/AppError");


// GET ALL CHARITIES
exports.getAllCharities = async () => {
    return adminRepo.getAllCharities();
};


// GET PENDING CHARITIES
exports.getPendingCharities = async (page, limit) => {

    const offset = (page - 1) * limit;

    const { count, rows } = await adminRepo.getPendingCharities(limit, offset);

    return {
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
};


// APPROVE CHARITY
exports.approveCharity = async (charityId) => {

    const charity = await adminRepo.findCharityById(charityId);

    if (!charity) {
        throw new AppError("Charity not found", 404);
    }

    if (charity.status !== "PENDING") {
        throw new AppError("Charity already processed", 400);
    }

    charity.status = "APPROVED";

    await adminRepo.saveCharity(charity);
};


// REJECT CHARITY
exports.rejectCharity = async (charityId) => {

    const charity = await adminRepo.findCharityWithUser(charityId);

    if (!charity) {
        throw new AppError("Charity not found", 404);
    }

    charity.status = "REJECTED";
    await adminRepo.saveCharity(charity);

    charity.User.role = "USER";
    await adminRepo.saveUser(charity.User);
};


// GET ALL USERS
exports.getAllUsers = async (page, limit) => {

    const offset = (page - 1) * limit;

    const { count, rows } = await adminRepo.getAllUsers(limit, offset);

    return {
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
};


// UPDATE USER ROLE
exports.updateUserRole = async (userId, role, adminId) => {

    const validRoles = ["USER", "CHARITY", "ADMIN"];

    if (!validRoles.includes(role)) {
        throw new AppError("Invalid role", 400);
    }

    const user = await adminRepo.findUserById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (adminId === userId) {
        throw new AppError("Cannot change your own role", 400);
    }

    if (user.role === "ADMIN") {
        throw new AppError("Admin role cannot be modified", 403);
    }

    user.role = role;

    await adminRepo.saveUser(user);
};


// GET ALL DONATIONS
exports.getAllDonations = async (page, limit) => {

    const offset = (page - 1) * limit;

    const { count, rows } = await adminRepo.getAllDonations(limit, offset);

    return {
        data: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
};