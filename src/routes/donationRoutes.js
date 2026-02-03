const express=require("express");
const router=express.Router();
const donationController=require("../controllers/donationController");
const authenticate=require("../middlewares/authMiddleware");

router.post("/create",authenticate,donationController.createDonationOrder);
router.post("/verify",authenticate,donationController.verifyPayment);
router.get("/my",authenticate,donationController.getMyDonations);
router.get("/:id/receipt",authenticate,donationController.downloadReceipt);

module.exports=router;