const ImpactReport = require("../models/impactReport");
const Charity = require("../models/charity");

exports.createImpactReport = async (req, res) => {
    try {
        const { title, description, images } = req.body;

        const charity = await Charity.findOne({
            where: { createdBy: req.user.userId },
        });

        if (!charity) {
            return res.status(403).json({ message: "Charity not found" });
        }

        const report = await ImpactReport.create({
            title,
            description,
            images,
            charityId: charity.id,
        });

        res.status(201).json(report);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getImpactReportsByCharity=async(req,res)=>{
    const{charityId}=req.params;

    const reports=await ImpactReport.findAll({
        where:{charityId},
        order:[["createdAt","DESC"]],
    });

    res.json(reports);
}
