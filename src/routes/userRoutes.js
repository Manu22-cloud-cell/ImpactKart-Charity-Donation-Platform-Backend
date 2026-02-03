const express=require("express");
const router=express.Router();

const authenticate=require("../middlewares/authMiddleware");
const userController=require("../controllers/userController");

router.get("/profile",authenticate, userController.getProfile);
router.put("/profile",authenticate,userController.updateProfile);
router.get("/donations",authenticate,userController.getDonationHistory)

module.exports=router;