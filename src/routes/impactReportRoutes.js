const express = require("express");
const router = express.Router();
const ImpactReportController=require("../controllers/impactReportController");
const authenticate=require("../middlewares/authMiddleware");
const authorize=require("../middlewares/roleMiddleware");

router.post("/",authenticate, authorize("CHARITY"),ImpactReportController.createImpactReport);
router.get("/:charityId",ImpactReportController.getImpactReportsByCharity);

module.exports=router;