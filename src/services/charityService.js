const { Op, Sequelize} = require("sequelize");
const charityRepo = require("../repositories/charityRepository");
const AppError = require("../utils/AppError");
const redis=require("../config/redis");


// REGISTER CHARITY
exports.registerCharity = async (userId, data) => {

    const { name, description, category, location, goalAmount } = data;

    if (!name || !description || !category || !location || !goalAmount) {
        throw new AppError("All fields are required", 400);
    }

    const existingCharity = await charityRepo.findCharityByCreator(userId);

    if (existingCharity) {
        throw new AppError("Charity already registered for this user", 409);
    }

    const charity = await charityRepo.createCharity({
        name,
        description,
        category,
        location,
        goalAmount,
        createdBy: userId
    });

    await charityRepo.updateUserRole(userId, "CHARITY");

    return charity;
};


// UPDATE CHARITY
exports.updateCharity = async (userId, data) => {

    const charity = await charityRepo.findCharityByCreator(userId);

    if (!charity) {
        throw new AppError("Charity not found", 404);
    }

    if (charity.status === "APPROVED") {
        throw new AppError("Approved campaigns cannot be edited", 400);
    }

    await charityRepo.updateCharity(charity, data);
};


// GET MY CHARITY
exports.getMyCharity = async (userId) => {

    const charity = await charityRepo.findCharityByCreatorWithUser(userId);

    if (!charity) {
        throw new AppError("No charity found for this user", 404);
    }

    return charity;
};


// DELETE CHARITY
exports.deleteMyCharity = async (userId) => {

    const charity = await charityRepo.findCharityByCreator(userId);

    if (!charity) {
        throw new AppError("Charity not found", 404);
    }

    if (charity.status !== "PENDING") {
        throw new AppError("Only pending campaigns can be deleted", 400);
    }

    await charityRepo.deleteCharity(charity);
};


// LIST CHARITIES
exports.listCharities = async (query) => {

    const { category, search } = query;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 6;

    // Unique cache key
    const cacheKey = `charities:${page}:${limit}:${category || "all"}:${search || "none"}`;

    // Check cache
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
        console.log("Redis HIT");
        return JSON.parse(cachedData);
    }

    console.log("Redis MISS");

    const where = {
        status: "APPROVED",
        collectedAmount: {
            [Op.lt]: Sequelize.col("goalAmount")
        }
    };

    if (category) where.category = category;

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } }
        ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await charityRepo.getApprovedCharities(
        where,
        limit,
        offset
    );

    const result = {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        charities: rows
    };

    // Store in Redis (TTL = 60 sec)
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);

    return result;
};


// GET SINGLE CHARITY
exports.getCharity = async (id) => {

    const cacheKey = `charity:${id}`;

    // Check cache
    const cached = await redis.get(cacheKey);

    if (cached) {
        console.log("Redis HIT (single)");
        return JSON.parse(cached);
    }

    console.log("Redis MISS (single)");

    const charity = await charityRepo.findCharityById(id);

    if (!charity || charity.status !== "APPROVED") {
        throw new AppError("Charity not found", 404);
    }

    // Store in Redis
    await redis.set(cacheKey, JSON.stringify(charity), "EX", 60);

    return charity;
};