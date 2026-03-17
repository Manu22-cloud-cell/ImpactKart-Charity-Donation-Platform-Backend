require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Make io available in app
app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join campaign room
    socket.on("joinCampaign", (charityId) => {
        console.log(`Socket ${socket.id} joined campaign_${charityId}`);
        socket.join(`campaign_${charityId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected");

        console.log("Models synced");

        // IMPORTANT: use server.listen instead of app.listen
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.log("DB connection failed:", error.message);
    }
})();