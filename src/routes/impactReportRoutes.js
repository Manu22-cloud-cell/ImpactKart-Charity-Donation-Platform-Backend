const express = require("express");
const router = express.Router();
const ImpactReportController=require("../controllers/impactReportController");
const authenticate=require("../middlewares/authMiddleware");
const authorize=require("../middlewares/roleMiddleware");
const upload=require("../middlewares/uploadImpactImages");

router.post(
    "/",
    authenticate,
    authorize("CHARITY"),
    upload.array("images", 5),
    ImpactReportController.createImpactReport
);
router.get("/:charityId",ImpactReportController.getImpactReportsByCharity);

module.exports=router;