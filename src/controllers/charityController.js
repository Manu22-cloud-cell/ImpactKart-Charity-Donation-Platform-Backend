const {Charity,User}=require("../models");

//REGISTER CHARITY

exports.registerCharity=async (req,res)=>{
    try {
        const {name,description,category,location,goalAmount}=req.body;

        if (!name || !description || !category || !location || !goalAmount) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingCharity= await Charity.findOne({
            where:{createdBy:req.user.userId}
        });

        if (existingCharity) {
            return res.status(409).json({
                message: "Charity already registered for this user"
            });
        }

        const charity=await Charity.create({
            name,
            description,
            category,
            location,
            goalAmount,
            createdBy: req.user.userId
        });

        // Upgrade user role to CHARITY
        await User.update(
            {role:"CHARITY"},
            {where:{id:req.user.userId}}
        );

        res.status(201).json({
            message: "Charity registered successfully. Awaiting admin approval.",
            charityId: charity.id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Charity registration failed"
        }); 
    }
};

//UPDATE CHARITY PROFILE

exports.updateCharity= async (req,res)=>{
    try {
        const charity=await Charity.findOne({
            where:{createdBy:req.user.userId}
        });

        if (!charity) {
            return res.status(404).json({
                message: "Charity not found"
            });
        }

        await charity.update(req.body);

        res.json({
            message: "Charity updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Update failed"
        });  
    }
};

//LIST APPROVED CHARITY

exports.listCharities= async (req,res)=>{
    const {category,location}=req.body;

    const where={status:"APPROVED"};
    if(category) where.category=category;
    if(location) where.location=location;

    const charities=await Charity.findAll({
        where,
        attributes:{exclude:["createdBy"]}
    });

    res.json(charities);
};

//GET SINGLE CHARITY

exports.getCharity=async (req,res)=>{
    const charity=await Charity.findByPk(req.params.id);

    if (!charity || charity.status !== "APPROVED") {
        return res.status(404).json({
            message: "Charity not found"
        });
    }

    res.json(charity);
};