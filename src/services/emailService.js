const transporter = require("../config/mailtrap");

exports.sendDonationConfirmation = async ({
    to,
    name,
    amount,
    charityName,
}) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: "Thank you for your donation!!",
        html: `
      <h2>Thank you, ${name}!</h2>
      <p>We’ve received your donation of <strong>₹${amount}</strong>.</p>
      <p><strong>Charity:</strong> ${charityName}</p>
      <p>Your support helps make a difference.</p>
      <br/>
      <p>— Team ImpactKart</p>
    `,
    });
};

