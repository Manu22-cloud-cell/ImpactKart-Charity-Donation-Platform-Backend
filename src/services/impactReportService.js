const charityRepository = require("../repositories/charityRepository");
const impactReportRepository = require("../repositories/impactReportRepository");
const uploadToS3 = require("../utils/uploadToS3");
const AppError = require("../utils/AppError");


// CREATE IMPACT REPORT
exports.createImpactReport = async (userId, data, files) => {

    const { title, description } = data;

    if (!title || !description) {
        throw new AppError("Title and description are required", 400);
    }

    const charity = await charityRepository.findCharityByCreator(userId);

    if (!charity) {
        throw new AppError(
            "Only registered charities can create impact reports",
            403
        );
    }

    let imageUrls = [];

    if (files && files.length > 0) {

        for (const file of files) {
            const url = await uploadToS3(file);
            imageUrls.push(url);
        }

    }

    const report = await impactReportRepository.createImpactReport({
        title,
        description,
        images: imageUrls,
        charityId: charity.id
    });

    return report;
};



// GET REPORTS BY CHARITY
exports.getImpactReportsByCharity = async (charityId) => {

    return impactReportRepository.getReportsByCharity(charityId);

};