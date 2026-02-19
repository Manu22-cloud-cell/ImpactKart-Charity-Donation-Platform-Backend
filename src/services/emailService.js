const transporter = require("../config/mail");
const generateReceipt = require("../utils/generateDonationReceipt");

exports.sendDonationConfirmation = async ({
    to,
    name,
    amount,
    charityName,
    donation,
    user,
    charity,
}) => {

    const pdfBuffer = await generateReceipt(donation, user, charity);

    await transporter.sendMail({
        from: `"ImpactKart" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: "Donation Successful - ImpactKart",
        html: `
            <h2>Thank you ${name}!</h2>
            <p>Your donation of ₹${amount} to <b>${charityName}</b> was successful.</p>
            <p>Please find your receipt attached.</p>
            <br/>
            <p>ImpactKart Team</p>
        `,
        attachments: [
            {
                filename: `donation-receipt-${donation.id}.pdf`,
                content: pdfBuffer,
            },
        ],
    });
};
