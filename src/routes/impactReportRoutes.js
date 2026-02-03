const express = require("express");
const router = express.Router();
const ImpactReportController=require("../controllers/impactReportController");
const authenticate=require("../middlewares/authMiddleware");

router.post("/",authenticate,ImpactReportController.createImpactReport);
router.get("/:charityId",ImpactReportController.getImpactReportsByCharity);

module.exports=router;