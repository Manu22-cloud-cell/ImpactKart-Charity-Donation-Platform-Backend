const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const logger = require("./utils/logger");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const charityRoutes = require("./routes/charityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donationRoutes = require("./routes/donationRoutes");
const impactReportRoutes = require("./routes/impactReportRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const errorHandler = require("./middlewares/errorHandler");
const {apiLimiter}=require("./middlewares/rateLimiter");

const app = express();

// Morgan → Winston Stream

const stream = {
    write: (message) => logger.info(message.trim()),
};


// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "views")));


// Request Logging

app.use(
    morgan("combined", {
        stream,
    })
);


// Routes

app.use("/api",apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/impact-reports", impactReportRoutes);
app.use("/api/password", passwordRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "dashboard.html"));
});


// Global Error Handler

app.use(errorHandler);

module.exports = app;