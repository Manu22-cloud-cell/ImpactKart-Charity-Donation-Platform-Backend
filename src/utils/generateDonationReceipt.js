const PDFDocument = require("pdfkit");

const generateDonationReceipt = (donation, user, charity, res) => {
    const doc = new PDFDocument({ margin: 50 });

    //Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment,filename=donation-receipt-${donation.id}.pdf`
    );

    doc.pipe(res);

    //Title
    doc
        .fontSize(20)
        .text("Donation Receipt", { align: "center" })
        .moveDown();

    //Charity info
    doc
        .fontSize(14)
        .text(`Charity: ${charity.name}`)
        .text(`Category: ${charity.category}`)
        .text(`Location: ${charity.location}`)
        .moveDown();

    //Donor info
    doc
        .fontSize(14)
        .text(`Donor Name: ${user.name}`)
        .text(`Email: ${user.email}`)
        .text(`Phone: ${user.phone}`)
        .moveDown();

    // Donation Info
    doc
        .fontSize(14)
        .text(`Donation Amount: ₹${donation.amount}`)
        .text(`Payment ID: ${donation.paymentId}`)
        .text(`Status: ${donation.status}`)
        .text(`Date: ${donation.createdAt.toDateString()}`)
        .moveDown();

    // Footer
    doc
        .fontSize(10)
        .text(
            "Thank you for your generous contribution! This receipt can be used for your records.",
            { align: "center" }
        );

    doc.end();

};

module.exports = generateDonationReceipt;