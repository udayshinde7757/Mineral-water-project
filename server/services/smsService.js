/**
 * SMS Service — Twilio Integration
 * Sends order confirmation SMS to the customer.
 * Gracefully handles missing credentials (logs warning instead of crashing).
 */

/**
 * Send order confirmation SMS
 * @param {Object} order - The order document from MongoDB
 */
const sendOrderConfirmationSMS = async (order) => {
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.warn("⚠️  Twilio credentials not configured. Skipping SMS notification.");
      return { success: false, message: "Twilio not configured" };
    }

    // Dynamic import so the app doesn't crash if twilio isn't installed
    const twilio = require("twilio");
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const orderId = order._id.toString().slice(-8).toUpperCase();
    const estimatedDate = new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const messageBody = `AquaPure: Thank you for your order! Your order #${orderId} has been placed successfully. Total: ₹${order.totalAmount}. Estimated delivery: ${estimatedDate}. Track your order anytime from your AquaPure account.`;

    // Ensure phone number has country code
    let phoneNumber = order.shippingAddress.phone;
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+91" + phoneNumber.replace(/^0+/, "");
    }

    const message = await client.messages.create({
      body: messageBody,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log("📱 Order confirmation SMS sent:", message.sid);
    return { success: true, messageSid: message.sid };
  } catch (error) {
    console.error("❌ SMS sending failed:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { sendOrderConfirmationSMS };
