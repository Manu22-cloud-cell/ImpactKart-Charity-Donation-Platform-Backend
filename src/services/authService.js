const bcrypt = require("bcryptjs");

const authRepository = require("../repositories/authRepository");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwt");

// REGISTER

exports.registerUser = async (data) => {

    const { name, email, phone, password } = data;

    if (!name || !email || !phone || !password) {
        throw new AppError("All fields are required", 400);
    }

    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
        throw new AppError("Email already exists", 409);
    }

    const user = await authRepository.createUser({
        name,
        email,
        phone,
        password
    });

    return user;
};


// LOGIN

exports.loginUser = async (loginId, password) => {

    if (!loginId || !password) {
        throw new AppError("Login ID and password required", 400);
    }

    const user = await authRepository.findUserByLoginId(loginId);

    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken({
        userId: user.id,
        role: user.role
    });

    return token;
};