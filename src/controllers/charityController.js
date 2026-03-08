const asyncHandler = require("../middlewares/asyncHandler");
const charityService = require("../services/charityService");


// REGISTER CHARITY
exports.registerCharity = asyncHandler(async (req, res) => {

    const charity = await charityService.registerCharity(
        req.user.userId,
        req.body
    );

    res.status(201).json({
        message: "Charity registered successfully. Awaiting admin approval.",
        charityId: charity.id
    });

});


// UPDATE CHARITY
exports.updateCharity = asyncHandler(async (req, res) => {

    await charityService.updateCharity(
        req.user.userId,
        req.body
    );

    res.json({
        message: "Charity updated successfully"
    });

});


// GET MY CHARITY
exports.getMyCharity = asyncHandler(async (req, res) => {

    const charity = await charityService.getMyCharity(
        req.user.userId
    );

    res.json(charity);

});


// DELETE CHARITY
exports.deleteMyCharity = asyncHandler(async (req, res) => {

    await charityService.deleteMyCharity(
        req.user.userId
    );

    res.json({
        message: "Campaign deleted successfully"
    });

});


// LIST CHARITIES
exports.listCharities = asyncHandler(async (req, res) => {

    const result = await charityService.listCharities(req.query);

    res.json(result);

});


// GET SINGLE CHARITY
exports.getCharity = asyncHandler(async (req, res) => {

    const charity = await charityService.getCharity(req.params.id);

    res.json(charity);

});