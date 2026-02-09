const User=require("../models/user");
const Donation=require("../models/donation");
const Charity=require("../models/charity");

// GET USER PROFILE

exports.getProfile = async (req, res)=>{
    try {
        const user=await User.findByPk(req.user.userId, {
            attributes: {exclude:["password"]}
        });

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile fetched successfully",
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch profile"
        }); 
    }
};

//UPDATE USER PROFILE

exports.updateProfile=async (req,res)=>{
    try {
        const {name,phone,password}=req.body;

        const user= await User.findByPk(req.user.userId);

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if(name) user.name=name;
        if(phone) user.phone=phone;
        if(password) user.password=password; //hashed via hook

        await user.save();
        res.json({
            message:"Profile updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Profile update failed"
        });   
    }
};

//USER DONATION HISTORY(placeholder)

exports.getDonationHistory = async (req, res) => {
    try {
        const donations = await Donation.findAll({
            where: {
                userId: req.user.userId,
            },
            include: [
                {
                    model: Charity,
                    attributes: ["id", "name", "category", "location"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({
            message: "Donation history fetched successfully",
            count: donations.length,
            donations,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch donation history",
        });
    }
};