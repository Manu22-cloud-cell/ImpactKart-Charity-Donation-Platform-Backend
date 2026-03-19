const { Worker } = require("bullmq");
const { sendDonationConfirmation } = require("../services/emailService");
const redis = require("../config/redis");
const donationRepo = require("../repositories/donationRepository");

console.log("Email Worker started...");

const worker = new Worker(
    "emailQueue",
    async (job) => {
        console.log("Job received:", job.id, job.name, job.data);

        if (job.name === "sendDonationEmail") {
            try {
                // Fetch full donation with relations
                const donation = await donationRepo.findDonationById(job.data.donationId);

                if (!donation) {
                    throw new Error("Donation not found");
                }

                await sendDonationConfirmation({
                    ...job.data,
                    donation,
                    user: donation.User,
                    charity: donation.Charity,
                });

                console.log("Email sent");
            } catch (err) {
                console.error("Email failed:", err);
                throw err; // required for retry
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