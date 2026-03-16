const rateLimit = require("express-rate-limit");

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// Login limiter
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Try again later."
});

// Donation limiter
const donationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: "Too many donation requests."
});

module.exports = {
    apiLimiter,
    loginLimiter,
    donationLimiter
};