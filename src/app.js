const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const charityRoutes = require("./routes/charityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donationRoutes=require("./routes/donationRoutes");
const impactReportRoutes=require("./routes/impactReportRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations",donationRoutes);
app.use("/api/impact-reports",impactReportRoutes);

app.get("/", (req, res) => {
    res.json({ message: "ImpactKart API running" });
});

module.exports = app;

