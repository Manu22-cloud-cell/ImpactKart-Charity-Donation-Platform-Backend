const sequelize=require("../config/database");

const User=require("./user");
const Charity=require("./charity");
const Donation=require("./donation");
const ImpactReport=require("./impactReport");
const ForgotPasswordRequest=require("./forgotPassword");

User.hasOne(Charity,{foreignKey:"createdBy"});
Charity.belongsTo(User,{foreignKey:"createdBy"});

User.hasMany(Donation,{foreignKey:"userId"});
Donation.belongsTo(User,{foreignKey:"userId"});

Charity.hasMany(Donation,{foreignKey:"charityId"});
Donation.belongsTo(Charity,{foreignKey:"charityId"});

Charity.hasMany(ImpactReport,{foreignKey:"charityId"});
ImpactReport.belongsTo(Charity,{foreignKey:"charityId"});

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

module.exports= {
    sequelize,
    User,
    Charity,
    Donation,
    ImpactReport,
    ForgotPasswordRequest,
};
