const asyncHandler = require("../middlewares/asyncHandler");
const impactReportService = require("../services/impactReportService");


// CREATE IMPACT REPORT
exports.createImpactReport = asyncHandler(async (req, res) => {

    const report = await impactReportService.createImpactReport(
        req.user.userId,
        req.body,
        req.files
    );

    res.status(201).json({
        message: "Impact report created successfully",
        report
    });

});


// GET REPORTS BY CHARITY
exports.getImpactReportsByCharity = asyncHandler(async (req, res) => {

    const reports = await impactReportService.getImpactReportsByCharity(
        req.params.charityId
    );

    res.json(reports);

});