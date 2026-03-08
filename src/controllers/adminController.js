const asyncHandler = require("../middlewares/asyncHandler");
const adminService = require("../services/adminService");


// GET ALL CHARITIES
exports.getAllCharities = asyncHandler(async (req, res) => {

    const charities = await adminService.getAllCharities();

    res.json(charities);

});


// GET PENDING CHARITIES
exports.getPendingCharities = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const result = await adminService.getPendingCharities(page, limit);

    res.json(result);

});


// APPROVE CHARITY
exports.approveCharity = asyncHandler(async (req, res) => {

    await adminService.approveCharity(req.params.id);

    res.json({
        message: "Charity approved successfully"
    });

});


// REJECT CHARITY
exports.rejectCharity = asyncHandler(async (req, res) => {

    await adminService.rejectCharity(req.params.id);

    res.json({
        message: "Charity rejected and role reverted"
    });

});


// GET ALL USERS
exports.getAllUsers = asyncHandler(async (req, res) => {

    const users = await adminService.getAllUsers();

    res.json(users);

});


// UPDATE USER ROLE
exports.updateUserRole = asyncHandler(async (req, res) => {

    const userId = parseInt(req.params.id);
    const { role } = req.body;

    await adminService.updateUserRole(
        userId,
        role,
        req.user.userId
    );

    res.json({
        message: "User role updated successfully"
    });

});


// GET ALL DONATIONS
exports.getAllDonations = asyncHandler(async (req, res) => {

    const donations = await adminService.getAllDonations();

    res.json(donations);

});