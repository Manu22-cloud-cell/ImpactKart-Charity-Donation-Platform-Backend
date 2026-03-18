const { Worker } = require("bullmq");
const { sendDonationConfirmation } = require("../services/emailService");

const worker = new Worker(
    "emailQueue",
    async (job) => {
        console.log("Processing email job:", job.name);

        if (job.name === "sendDonationEmail") {
            await sendDonationConfirmation(job.data);
        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379
        }
    }
);

worker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.id}`, err);
});