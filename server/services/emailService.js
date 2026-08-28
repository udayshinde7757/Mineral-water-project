const NotificationLog = require("../models/NotificationLog");
const SiteSettings = require("../models/SiteSettings");
const sendEmail = require("../utils/sendEmail");

/**
 * Sends order status update email to customer & logs in NotificationLog DB.
 */
async function sendOrderStatusEmail(order, statusEvent, customNotes = "") {
  const recipient = order.shippingAddress?.email || "customer@example.com";
  const customerName = order.shippingAddress?.fullName || "Valued Customer";
  const orderIdStr = order._id ? order._id.toString() : "ORD-UNKNOWN";
  const productsList = (order.products || [])
    .map((p) => `<li>${p.name} (x${p.quantity}) - ₹${p.price * p.quantity}</li>`)
    .join("");

  const subject = `[AquaPure] Order #${orderIdStr.slice(-6).toUpperCase()} Update: ${statusEvent}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px;">AquaPure Mineral Water</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Pure & Refreshing Hydration Delivered to Your Doorstep</p>
      </div>
      <div style="padding: 24px; color: #333333;">
        <h2 style="color: #0284c7; margin-top: 0;">Hello ${customerName},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Your order status has been updated to: <strong><span style="color: #0369a1;">${statusEvent}</span></strong>.
        </p>

        ${customNotes ? `<div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px; margin: 16px 0; font-size: 14px; color: #0369a1;"><strong>Note:</strong> ${customNotes}</div>` : ""}

        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px; color: #1e293b;">Order Details:</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Order ID:</strong> #${orderIdStr}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> ₹${order.totalAmount}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Expected Delivery:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN") : "3-4 Business Days"}</p>
        </div>

        <h4 style="margin-bottom: 8px; font-size: 15px; color: #1e293b;">Items Ordered:</h4>
        <ul style="padding-left: 20px; font-size: 14px; color: #475569;">
          ${productsList || "<li>AquaPure Mineral Water Bottled Package</li>"}
        </ul>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 13px; color: #64748b; text-align: center;">
          Thank you for choosing AquaPure. If you have any questions, contact support at support@aquapure.com.
        </p>
      </div>
    </div>
  `;

  let status = "Sent";
  let errorMsg = null;

  try {
    await sendEmail({
      to: recipient,
      subject,
      html: htmlContent,
    });
    console.log(`[Email Service] Email sent successfully to ${recipient} for event: ${statusEvent}`);
  } catch (err) {
    status = "Failed";
    errorMsg = err.message;
    console.error(`[Email Service Error] Failed to send email to ${recipient}:`, err.message);
  }

  // Save to Notification Log DB
  try {
    await NotificationLog.create({
      type: "Email",
      recipient,
      event: statusEvent,
      orderId: order._id,
      customerName,
      messageSnippet: `Subject: ${subject} | Status: ${statusEvent}`,
      status,
      error: errorMsg,
      sentAt: new Date(),
    });
  } catch (dbErr) {
    console.error("Failed to record notification log:", dbErr.message);
  }

  return { success: status === "Sent", status, error: errorMsg };
}

module.exports = {
  sendOrderStatusEmail,
};
