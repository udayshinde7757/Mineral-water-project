const NotificationLog = require("../models/NotificationLog");
const SiteSettings = require("../models/SiteSettings");

/**
 * Sends order status update via WhatsApp & records in NotificationLog DB.
 */
async function sendOrderStatusWhatsApp(order, statusEvent, customNotes = "") {
  const recipient = order.shippingAddress?.phone || "+919876543210";
  const customerName = order.shippingAddress?.fullName || "Customer";
  const orderIdStr = order._id ? order._id.toString() : "ORD-UNKNOWN";
  const shortId = orderIdStr.slice(-6).toUpperCase();

  const messageText = `🌊 *AquaPure Order Update* 🌊\n\n` +
    `Hello *${customerName}*,\n\n` +
    `Your AquaPure order *#${shortId}* is now *${statusEvent}*!\n\n` +
    `💰 *Total Amount:* ₹${order.totalAmount}\n` +
    `🚚 *Expected Delivery:* ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN") : "3-4 Days"}\n` +
    (customNotes ? `📌 *Note:* ${customNotes}\n\n` : "\n") +
    `Track your order or get help anytime at support@aquapure.com or +91 98765 43210.\n` +
    `Thank you for staying hydrated with AquaPure! 💧`;

  let status = "Sent";
  let errorMsg = null;

  try {
    const settings = await SiteSettings.findOne();
    const phoneId = settings?.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_ID;
    const accessToken = settings?.whatsappAccessToken || process.env.WHATSAPP_TOKEN;

    if (phoneId && accessToken) {
      // Execute Cloud API call using fetch
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipient.replace(/\D/g, ""),
          type: "text",
          text: { body: messageText },
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || "WhatsApp API error");
      }
      console.log(`[WhatsApp Service] Message dispatched to ${recipient}`);
    } else {
      console.log(`[WhatsApp Service Mock] WhatsApp credentials not configured. Simulated dispatch to ${recipient}:\n${messageText}`);
    }
  } catch (err) {
    status = "Failed";
    errorMsg = err.message;
    console.error(`[WhatsApp Service Error] Failed to send WhatsApp to ${recipient}:`, err.message);
  }

  // Save to Notification Log DB
  try {
    await NotificationLog.create({
      type: "WhatsApp",
      recipient,
      event: statusEvent,
      orderId: order._id,
      customerName,
      messageSnippet: messageText.slice(0, 150) + "...",
      status,
      error: errorMsg,
      sentAt: new Date(),
    });
  } catch (dbErr) {
    console.error("Failed to record WhatsApp notification log:", dbErr.message);
  }

  return { success: status === "Sent", status, error: errorMsg };
}

module.exports = {
  sendOrderStatusWhatsApp,
};
