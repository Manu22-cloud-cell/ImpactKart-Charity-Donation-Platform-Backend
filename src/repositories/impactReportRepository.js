const ImpactReport = require("../models/impactReport");

exports.createImpactReport = (data) => {
    return ImpactReport.create(data);
};

exports.getReportsByCharity = (charityId) => {
    return ImpactReport.findAll({
        where: { charityId }
    });
};