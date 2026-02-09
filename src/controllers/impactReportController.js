const ImpactReport = require("../models/impactReport");
const Charity = require("../models/charity");

exports.createImpactReport = async (req, res) => {
    try {
        const { title, description, images } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
            });
        }

        const charity = await Charity.findOne({
            where: { createdBy: req.user.userId },
        });

        if (!charity) {
            return res.status(403).json({
                message: "Only registered charities can create impact reports",
            });
        }

        const report = await ImpactReport.create({
            title,
            description,
            images,
            charityId: charity.id,
        });

        res.status(201).json({
            message: "Impact report created successfully",
            reportId: report.id,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create impact report",
        });
    };
};

exports.getImpactReportsByCharity = async (req, res) => {
    try {
        const reports = await ImpactReport.findAll({
            where: { charityId: req.params.charityId },
        });

        res.json(reports);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch impact reports",
        });
    }
}
