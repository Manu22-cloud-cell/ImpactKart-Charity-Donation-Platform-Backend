const asyncHandler = require("../middlewares/asyncHandler");
const authService = require("../services/authService");


// REGISTER

exports.register = asyncHandler(async (req, res) => {

    const user = await authService.registerUser(req.body);

    res.status(201).json({
        message: "User registered successfully",
        userId: user.id
    });

});



// LOGIN

exports.login = asyncHandler(async (req, res) => {

    const { loginId, password } = req.body;

    const token = await authService.loginUser(loginId, password);

    res.status(200).json({
        message: "Login successfull",
        token
    });

});