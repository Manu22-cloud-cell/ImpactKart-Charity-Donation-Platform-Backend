const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const User = require("../models/user");
const { generateToken } = require("../utils/jwt")

//Register

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password
        });

        res.status(201).json({
            message: "User registered successfully",
            userId: user.id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Registration failed"
        });
    }
};

//LOGIN

exports.login = async (req, res) => {
    try {

        const { loginId, password } = req.body;

        if (!loginId || !password) {
            return res.status(400).json({
                message: "Login ID and password required"
            });
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [{ email: loginId }, { phone: loginId }],
            },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken({
            userId: user.id,
            role: user.role
        });

        res.status(200).json({
            message: "Login successfull",
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};