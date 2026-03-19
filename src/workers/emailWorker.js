const { Worker } = require("bullmq");
const { sendDonationConfirmation } = require("../services/emailService");
const redis = require("../config/redis");

console.log("Email Worker started...");

const worker = new Worker(
    "emailQueue",
    async (job) => {
        console.log("Job received:", job.id, job.name, job.data);

        if (job.name === "sendDonationEmail") {
            try {
                await sendDonationConfirmation(job.data);
                console.log("Email sent");
            } catch (err) {
                console.error("Email failed:", err);
                throw err;
            }
        }
    },
    {
        connection: redis
    }
);

worker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
    console.error(`Job failed: ${job?.id}`, err);
});