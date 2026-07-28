/**
 * Create a reusable transporter using SMTP credentials from .env
 */
const createTransporter = () => {
  const nodemailer = require("nodemailer");
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Format currency in INR
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate branded HTML email template for order confirmation
 */
const generateOrderEmailHTML = (order) => {
  const productsHTML = order.products
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${item.image}" alt="${item.name}" 
              style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px; background: #E6F7FF; padding: 4px;" />
            <span style="font-weight: 600; color: #333;">${item.name}</span>
          </div>
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f0f0f0; color: #555;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const estimatedDate = new Date(order.estimatedDelivery).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0A77B7 0%, #00B8A9 100%); padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">💧 AquaPure</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Pure from Source to Bottle</p>
      </div>

      <!-- Success Badge -->
      <div style="text-align: center; padding: 32px 24px 16px;">
        <div style="display: inline-block; background: #E6F7FF; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">✅</div>
        <h2 style="color: #333; margin: 16px 0 4px; font-size: 22px;">Order Confirmed!</h2>
        <p style="color: #777; margin: 0; font-size: 14px;">Thank you for choosing AquaPure, <strong>${order.shippingAddress.fullName}</strong>!</p>
      </div>

      <!-- Order Info -->
      <div style="margin: 0 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          <tr>
            <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Order Date:</strong></td>
            <td style="text-align: right;">${new Date(order.orderDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Payment Method:</strong></td>
            <td style="text-align: right;">${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Payment Status:</strong></td>
            <td style="text-align: right;">
              <span style="background: ${order.paymentStatus === "Paid" ? "#00B8A9" : "#f59e0b"}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;">
                ${order.paymentStatus}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Products Table -->
      <div style="margin: 20px 24px;">
        <h3 style="color: #333; font-size: 16px; margin-bottom: 12px;">📦 Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f0f7fb;">
              <th style="padding: 10px 12px; text-align: left; color: #0A77B7; font-weight: 700;">Product</th>
              <th style="padding: 10px 12px; text-align: center; color: #0A77B7; font-weight: 700;">Qty</th>
              <th style="padding: 10px 12px; text-align: right; color: #0A77B7; font-weight: 700;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTML}
          </tbody>
        </table>
      </div>

      <!-- Price Summary -->
      <div style="margin: 0 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          <tr>
            <td style="padding: 4px 0;">Subtotal</td>
            <td style="text-align: right;">${formatCurrency(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">Delivery Charges</td>
            <td style="text-align: right;">${order.deliveryCharges === 0 ? '<span style="color: #00B8A9; font-weight: 700;">FREE</span>' : formatCurrency(order.deliveryCharges)}</td>
          </tr>
          ${order.gst > 0 ? `<tr><td style="padding: 4px 0;">GST</td><td style="text-align: right;">${formatCurrency(order.gst)}</td></tr>` : ""}
          <tr>
            <td style="padding: 8px 0 4px; border-top: 2px solid #e0e0e0; font-weight: 800; font-size: 15px; color: #333;">Total Amount</td>
            <td style="padding: 8px 0 4px; border-top: 2px solid #e0e0e0; text-align: right; font-weight: 800; font-size: 18px; color: #0A77B7;">${formatCurrency(order.totalAmount)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="margin: 20px 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <h3 style="color: #333; font-size: 14px; margin: 0 0 8px;">🚚 Shipping Address</h3>
        <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.6;">
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ", " + order.shippingAddress.addressLine2 : ""}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}<br>
          ${order.shippingAddress.country}<br>
          📱 ${order.shippingAddress.phone}
        </p>
      </div>

      <!-- Estimated Delivery -->
      <div style="margin: 20px 24px; text-align: center; padding: 20px; background: linear-gradient(135deg, #E6F7FF 0%, #e0f8f6 100%); border-radius: 12px;">
        <p style="color: #555; font-size: 13px; margin: 0 0 4px;">Estimated Delivery</p>
        <p style="color: #0A77B7; font-size: 18px; font-weight: 800; margin: 0;">${estimatedDate}</p>
      </div>

      <!-- Footer -->
      <div style="background: #333; padding: 24px; text-align: center; margin-top: 20px;">
        <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} AquaPure. All rights reserved.</p>
        <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 8px 0 0;">Pure hydration delivered to your doorstep.</p>
      </div>
    </div>
  </body>
  </html>`;
};

/**
 * Send order confirmation email
 * @param {Object} order - The order document from MongoDB
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.warn("⚠️  SMTP credentials not configured. Skipping email notification.");
      return { success: false, message: "SMTP not configured" };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"AquaPure" <${process.env.SMTP_EMAIL}>`,
      to: order.shippingAddress.email,
      subject: `✅ AquaPure Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
      html: generateOrderEmailHTML(order),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Order confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { sendOrderConfirmationEmail };
