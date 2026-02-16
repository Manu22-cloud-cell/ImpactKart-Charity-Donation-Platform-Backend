const { Charity, User, Donation } = require("../models");

//GET ALL CHARITIES
exports.getAllCharities = async (req, res) => {
    try {

        const charities = await Charity.findAll();
        res.json(charities);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch charities" });
    }
}


// GET PENDING CHARITIES (Server-side Pagination)
exports.getPendingCharities = async (req, res) => {
    try {
        // Get page & limit from query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const offset = (page - 1) * limit;

        const { count, rows } = await Charity.findAndCountAll({
            where: { status: "PENDING" },
            include: {
                model: User,
                attributes: ["id", "name", "email", "phone"]
            },
            limit,
            offset,
            order: [["createdAt", "DESC"]] // newest first
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to fetch pending charities"
        });
    }
};

//APPROVE CHARITY

exports.approveCharity = async (req, res) => {
    try {
        const charity = await Charity.findByPk(req.params.id);

        if (!charity) {
            return res.status(404).json({
                message: "Charity not found"
            });
        }

        if (charity.status !== "PENDING") {
            return res.status(400).json({ message: "Charity already processed" });
        }

        charity.status = "APPROVED";
        await charity.save();

        res.json({
            message: "Charity approved successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Approval failed"
        });
    }
};

//REJECT CHARITY

exports.rejectCharity = async (req, res) => {
    try {
        const charity = await Charity.findByPk(req.params.id);

        if (!charity) {
            return res.status(404).json({
                message: "Charity not found"
            });
        }

        charity.status = "REJECTED";
        await charity.save();

        res.json({
            message: "Charity rejected"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Rejection failed"
        });
    }
};

//VIEW ALL USERS

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        });

        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch users" });

    }
};

//UPDATE USER ROLE

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (req.user.userId === userId) {
            return res.status(400).json({ message: "Cannot change own role" });
        }

        const validRoles = ["USER", "CHARITY", "ADMIN"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        await User.update({ role }, { where: { id: userId } });

        res.json({ message: "User role updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to update user role" });
    }
};

//View all Donations

exports.getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.findAll({
            include: [
                { model: User, attributes: ["name", "email"] },
                { model: Charity, attributes: ["name"] },
            ],
        });

        res.json(donations);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch all donations" });
    }
};





