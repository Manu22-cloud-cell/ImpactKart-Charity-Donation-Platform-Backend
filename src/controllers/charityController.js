const { Charity, User } = require("../models");
const { Op } = require("sequelize");

//REGISTER CHARITY

exports.registerCharity = async (req, res) => {
    try {
        const { name, description, category, location, goalAmount } = req.body;

        if (!name || !description || !category || !location || !goalAmount) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingCharity = await Charity.findOne({
            where: { createdBy: req.user.userId }
        });

        if (existingCharity) {
            return res.status(409).json({
                message: "Charity already registered for this user"
            });
        }

        const charity = await Charity.create({
            name,
            description,
            category,
            location,
            goalAmount,
            createdBy: req.user.userId
        });

        // Upgrade user role to CHARITY
        await User.update(
            { role: "CHARITY" },
            { where: { id: req.user.userId } }
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

exports.updateCharity = async (req, res) => {
    try {
        const charity = await Charity.findOne({
            where: { createdBy: req.user.userId }
        });

        if (!charity) {
            return res.status(404).json({
                message: "Charity not found"
            });
        }

        if (charity.status === "APPROVED") {
            return res.status(400).json({
                message: "Approved campaigns cannot be edited"
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

// GET MY CHARITY
exports.getMyCharity = async (req, res) => {
    try {
        const charity = await Charity.findOne({
            where: { createdBy: req.user.userId },
            include: {
                model: User,
                attributes: ["name", "email"]
            }
        });

        if (!charity) {
            return res.status(404).json({
                message: "No charity found for this user"
            });
        }

        res.json(charity);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch charity"
        });
    }
};

// DELETE MY CHARITY (ONLY IF PENDING)
exports.deleteMyCharity = async (req, res) => {
    try {

        const charity = await Charity.findOne({
            where: { createdBy: req.user.userId }
        });

        if (!charity) {
            return res.status(404).json({ message: "Charity not found" });
        }

        if (charity.status !== "PENDING") {
            return res.status(400).json({
                message: "Only pending campaigns can be deleted"
            });
        }

        await charity.destroy();

        res.json({ message: "Campaign deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete campaign" });
    }
};

//LIST APPROVED CHARITY
exports.listCharities = async (req, res) => {
    try {
        const { category, location, search, page = 1, limit = 6 } = req.query;

        const where = { status: "APPROVED" };

        if (category) where.category = category;
        if (location) where.location = location;

        if (search) {
            where.name = {
                [Op.like]: `%${search}%`
            };
        }

        const offset = (page - 1) * limit;

        const charities = await Charity.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["createdBy"] }
        });

        res.json(charities);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch charities" });
    }
};

//GET SINGLE CHARITY

exports.getCharity = async (req, res) => {
    const charity = await Charity.findByPk(req.params.id);

    if (!charity || charity.status !== "APPROVED") {
        return res.status(404).json({
            message: "Charity not found"
        });
    }

    res.json(charity);
};