const crypto = require("crypto");

const orderId = "order_SDw4e0VBOM1wXc";
const paymentId = "pay_SDw4e0VBOM1wXc";
const secret = process.env.RAZORPAY_KEY_SECRET;

const body = orderId + "|" + paymentId;

const signature = crypto
  .createHmac("sha256", secret)
  .update(body)
  .digest("hex");

console.log(signature);