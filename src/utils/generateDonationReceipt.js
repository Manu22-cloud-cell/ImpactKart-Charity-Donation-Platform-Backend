const PDFDocument = require("pdfkit");

const generateDonationReceiptBuffer = (donation, user, charity) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        doc.info.Title = "Donation Receipt";
        doc.info.Author = "ImpactKart";
        doc.info.Subject = "Official Donation Receipt";
        doc.info.Creator = "ImpactKart Donation System";

        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        const amountInRupees = (donation.amount / 100).toFixed(2);

        doc
            .fontSize(20)
            .text("Donation Receipt", { align: "center" })
            .moveDown();

        doc
            .fontSize(14)
            .text(`Charity: ${charity.name}`)
            .text(`Category: ${charity.category}`)
            .text(`Location: ${charity.location}`)
            .moveDown();

        doc
            .text(`Donor Name: ${user.name}`)
            .text(`Email: ${user.email}`)
            .text(`Phone: ${user.phone || "N/A"}`)
            .moveDown();

        doc
            .text(`Donation Amount: ₹${amountInRupees}`)
            .text(`Payment ID: ${donation.paymentId}`)
            .text(`Order ID: ${donation.orderId}`)
            .text(`Date: ${donation.createdAt.toDateString()}`)
            .moveDown();

        doc
            .fontSize(10)
            .text("Thank you for your generous contribution!", {
                align: "center",
            });

        doc.end();
    });
};

module.exports = generateDonationReceiptBuffer;
