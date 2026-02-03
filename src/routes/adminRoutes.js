const express = require("express");
const router = express.Router();

const authenticate=require("../middlewares/authMiddleware");
const authorize=require("../middlewares/roleMiddleware");
const adminController=require("../controllers/adminController");

router.use(authenticate,authorize("ADMIN"));

router.get("/charities",adminController.getAllCharities);
router.get("/charities/pending",adminController.getPendingCharities);
router.put("/charities/:id/approve",adminController.approveCharity);
router.put("/charities/:id/reject",adminController.rejectCharity);

router.get("/users",adminController.getAllUsers);
router.put("/users/:id/role",adminController.updateUserRole);

router.get("/donations",adminController.getAllDonations);

module.exports=router;