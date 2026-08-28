/**
 * Notification Service — Handles all order-related notifications
 * Supports: Customer Email, Customer WhatsApp, Admin Email, Admin WhatsApp
 */

const { sendOrderConfirmationEmail } = require("./emailService");
const { sendOrderPlacedMessage } = require("./whatsappService");
const sendEmail = require("../utils/sendEmail");

/**
 * Format currency in INR
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Helper to get support email
 */
const getSupportEmail = () => process.env.AQUAPURE_SUPPORT_EMAIL || process.env.COMPANY_EMAIL || "support@aquapure.com";

/**
 * Common branded HTML email wrapper
 */
const buildBrandedEmail = ({ badge, title, subtitle, contentHTML, footerText }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 20px; margin-bottom: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0A77B7 0%, #00B8A9 100%); padding: 32px; text-align: center;">
      <div style="font-size: 42px; margin-bottom: 8px;">${badge}</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">${title}</h1>
      ${subtitle ? `<p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${subtitle}</p>` : ""}
    </div>

    <!-- Body Content -->
    <div style="padding: 24px 0;">
      ${contentHTML}
    </div>

    <!-- Footer -->
    <div style="background: #1e293b; padding: 24px; text-align: center; color: #ffffff;">
      <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">${footerText || "AquaPure — Pure & Refreshing Hydration"}</p>
      <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 6px 0 0;">Need assistance? Contact <a href="mailto:${getSupportEmail()}" style="color: #00B8A9; text-decoration: none;">${getSupportEmail()}</a></p>
    </div>
  </div>
</body>
</html>`;

/**
 * Generate HTML table rows for order items
 */
const generateProductsHTML = (products = []) => {
  return products
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333;">
        <strong>${item.name || "AquaPure Item"}</strong>
        ${item.volume ? `<br><span style="font-size: 11px; color: #888;">${item.volume}</span>` : ""}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #555;">
        x${item.quantity}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #0A77B7; font-weight: 700;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join("");
};

/**
 * Format full address from shippingAddress object
 */
const formatAddress = (address) => {
  if (!address) return "Address not provided";
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode ? `PIN: ${address.pincode}` : null,
  ].filter(Boolean);
  return parts.join(", ");
};

/**
 * Get estimated delivery string
 */
const getEstimatedDeliveryString = (order) => {
  if (order.estimatedDelivery) {
    return new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return "2-3 Business Days";
};

/**
 * Helper to send WhatsApp messages safely
 */
const sendWhatsAppMessage = async ({ to, templateName, params, label }) => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.warn(`⚠️  WhatsApp API not configured. Skipping ${label}.`);
    return { success: false, message: "WhatsApp API not configured" };
  }

  if (!templateName) {
    console.warn(`⚠️  WhatsApp template not specified. Skipping ${label}.`);
    return { success: false, message: "Template not specified" };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/[^0-9]/g, ""),
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: params,
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log(`📱 ${label} sent successfully:`, data.messages?.[0]?.id);
      return { success: true, messageId: data.messages?.[0]?.id };
    } else {
      console.error(`❌ ${label} failed:`, data.error?.message || JSON.stringify(data));
      return { success: false, message: data.error?.message };
    }
  } catch (err) {
    console.error(`❌ ${label} exception:`, err.message);
    return { success: false, message: err.message };
  }
};

/**
 * Send Customer Email Notification
 */
const sendCustomerEmail = async (order) => {
  try {
    const emailConfig = sendEmail.getValidatedEmailConfig ? sendEmail.getValidatedEmailConfig() : null;
    if (!emailConfig || emailConfig.provider === "mock") {
      console.warn("⚠️  Email provider not configured (no RESEND_API_KEY or SMTP). Skipping customer email.");
      return { success: false, message: "Email provider not configured" };
    }

    // Don't send email if using SMTP in production (Render blocks it)
    if (emailConfig.provider === "smtp" && process.env.NODE_ENV === "production") {
      console.warn("⚠️  SMTP provider in production (Render blocks ports 465/587). Set RESEND_API_KEY instead.");
      return { success: false, message: "SMTP not supported in production on Render" };
    }

    const productsHTML = generateProductsHTML(order.products);
    const estimatedDate = getEstimatedDeliveryString(order);

    const html = `
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
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">💧 AquaPure</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Order Confirmation</p>
        </div>

        <!-- Success Banner -->
        <div style="padding: 24px; text-align: center; background: #f0f7fb; border-bottom: 1px solid #e0eff8;">
          <div style="font-size: 40px; margin-bottom: 8px;">✅</div>
          <h2 style="color: #0A77B7; margin: 0 0 6px; font-size: 20px;">Thank You for Your Order!</h2>
          <p style="color: #555; margin: 0; font-size: 14px;">Hi <strong>${order.shippingAddress.fullName}</strong>, we've received your order and are getting it ready.</p>
        </div>

        <!-- Order Info -->
        <div style="padding: 24px; border-bottom: 1px solid #f0f0f0;">
          <table style="width: 100%; font-size: 13px; color: #555;">
            <tr>
              <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
              <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>Estimated Delivery:</strong></td>
              <td style="text-align: right; font-weight: 600; color: #00B8A9;">${estimatedDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>Payment Method:</strong></td>
              <td style="text-align: right;">${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</td>
            </tr>
          </table>
        </div>

        <!-- Products -->
        <div style="padding: 24px;">
          <h3 style="color: #333; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #0A77B7; padding-bottom: 8px; display: inline-block;">📦 Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px;">
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

        <!-- Total -->
        <div style="padding: 24px; background: #f8fafb; border-top: 1px solid #f0f0f0;">
          <table style="width: 100%; font-size: 13px; color: #555;">
            <tr>
              <td style="padding: 6px 0;">Subtotal</td>
              <td style="text-align: right;">${formatCurrency(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Delivery Charges</td>
              <td style="text-align: right;">${order.deliveryCharges === 0 ? '<span style="color: #00B8A9; font-weight: 700;">FREE</span>' : formatCurrency(order.deliveryCharges)}</td>
            </tr>
            ${order.gst > 0 ? `<tr><td style="padding: 6px 0;">GST</td><td style="text-align: right;">${formatCurrency(order.gst)}</td></tr>` : ""}
            <tr>
              <td style="padding: 10px 0 6px; border-top: 2px solid #e0e0e0; font-weight: 800; font-size: 15px; color: #333;">Total Amount</td>
              <td style="padding: 10px 0 6px; border-top: 2px solid #e0e0e0; text-align: right; font-weight: 800; font-size: 18px; color: #0A77B7;">${formatCurrency(order.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} AquaPure. All rights reserved.</p>
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 8px 0 0;">Pure hydration delivered to your doorstep.</p>
        </div>
      </div>
    </body>
    </html>`;

    const recipient = order.shippingAddress?.email || order.user?.email;
    if (!recipient) {
      console.warn("⚠️  No recipient email found on order. Skipping customer email.");
      return { success: false, message: "Recipient email missing" };
    }

    const info = await sendEmail({
      to: recipient,
      subject: `✅ AquaPure Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
      html,
    });
    console.log(`📧 Customer email sent successfully to ${recipient}:`, info?.messageId || "Dispatched");
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("❌ Customer email failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send Admin Email Notification
 */
const sendAdminEmail = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.COMPANY_EMAIL;

    if (!adminEmail) {
      console.warn("⚠️  Admin email not configured. Skipping admin email.");
      return { success: false, message: "Admin email not configured" };
    }

    const emailConfig = sendEmail.getValidatedEmailConfig ? sendEmail.getValidatedEmailConfig() : null;
    if (!emailConfig || emailConfig.provider === "mock") {
      console.warn("⚠️  Email provider not configured (no RESEND_API_KEY or SMTP). Skipping admin email.");
      return { success: false, message: "Email provider not configured" };
    }

    // Don't send email if using SMTP in production (Render blocks it)
    if (emailConfig.provider === "smtp" && process.env.NODE_ENV === "production") {
      console.warn("⚠️  SMTP provider in production (Render blocks ports 465/587). Set RESEND_API_KEY instead.");
      return { success: false, message: "SMTP not supported in production on Render" };
    }

    const productsHTML = generateProductsHTML(order.products);
    const addressFormatted = formatAddress(order.shippingAddress);

    const html = `
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
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">💧 AquaPure — New Order</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px;">Order Received from Customer</p>
        </div>

        <!-- Order ID & Date -->
        <div style="padding: 24px; background: #fff; border-bottom: 1px solid #f0f0f0;">
          <table style="width: 100%; font-size: 13px; color: #555;">
            <tr>
              <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
              <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>Payment Method:</strong></td>
              <td style="text-align: right;">${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;"><strong>Payment Status:</strong></td>
              <td style="text-align: right;">
                <span style="background: ${order.paymentStatus === "Paid" ? "#00B8A9" : "#f59e0b"}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;">
                  ${order.paymentStatus}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Customer Details -->
        <div style="padding: 24px; background: #f8fafb; border-bottom: 1px solid #f0f0f0;">
          <h3 style="color: #333; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #0A77B7; padding-bottom: 8px; display: inline-block;">👤 Customer Details</h3>
          <table style="width: 100%; font-size: 13px; color: #555;">
            <tr>
              <td style="padding: 4px 0; width: 120px;"><strong>Name:</strong></td>
              <td style="padding: 4px 0;">${order.shippingAddress.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>Phone:</strong></td>
              <td style="padding: 4px 0;">${order.shippingAddress.phone}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>Email:</strong></td>
              <td style="padding: 4px 0;">${order.shippingAddress.email}</td>
            </tr>
          </table>
        </div>

        <!-- Delivery Address -->
        <div style="padding: 24px; background: #f8fafb; border-bottom: 1px solid #f0f0f0;">
          <h3 style="color: #333; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #00B8A9; padding-bottom: 8px; display: inline-block;">🚚 Delivery Address</h3>
          <p style="color: #555; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">${addressFormatted}</p>
        </div>

        <!-- Products -->
        <div style="padding: 24px;">
          <h3 style="color: #333; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #0A77B7; padding-bottom: 8px; display: inline-block;">📦 Products Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px;">
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
        <div style="padding: 24px; background: #f8fafb; border-top: 1px solid #f0f0f0;">
          <table style="width: 100%; font-size: 13px; color: #555;">
            <tr>
              <td style="padding: 10px 0 6px; border-top: 2px solid #e0e0e0; font-weight: 800; font-size: 15px; color: #333;">Total Amount</td>
              <td style="padding: 10px 0 6px; border-top: 2px solid #e0e0e0; text-align: right; font-weight: 800; font-size: 18px; color: #0A77B7;">${formatCurrency(order.totalAmount)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">AquaPure Admin Notification</p>
        </div>
      </div>
    </body>
    </html>`;

    const info = await sendEmail({
      to: adminEmail,
      subject: `🔔 New AquaPure Order — #${order._id.toString().slice(-8).toUpperCase()} — ${formatCurrency(order.totalAmount)}`,
      html,
    });
    console.log("📧 Admin email sent:", info?.messageId || "Dispatched");
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("❌ Admin email failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send Customer WhatsApp — Order Placed
 */
const sendCustomerWhatsApp = async (order) => {
  const shortId = order._id.toString().slice(-8).toUpperCase();
  const customerName = order.shippingAddress.fullName;
  const phone = order.shippingAddress.phone;
  const estimatedDate = getEstimatedDeliveryString(order);

  return sendWhatsAppMessage({
    to: phone,
    templateName: process.env.WHATSAPP_ORDER_PLACED_TEMPLATE,
    params: [
      { type: "text", text: customerName },
      { type: "text", text: shortId },
      { type: "text", text: formatCurrency(order.totalAmount) },
      { type: "text", text: estimatedDate },
    ],
    label: "Customer order placed WhatsApp",
  });
};

/**
 * Send Admin WhatsApp — New Order Alert
 */
const sendAdminWhatsApp = async (order) => {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
  if (!adminPhone) {
    console.warn("⚠️  ADMIN_WHATSAPP_NUMBER not configured. Skipping admin WhatsApp.");
    return { success: false, message: "Admin WhatsApp not configured" };
  }

  const shortId = order._id.toString().slice(-8).toUpperCase();
  const customerName = order.shippingAddress.fullName;
  const addressFormatted = formatAddress(order.shippingAddress);
  const productsSummary = (order.products || []).map((p) => `${p.name} (x${p.quantity})`).join(", ");

  return sendWhatsAppMessage({
    to: adminPhone,
    templateName: process.env.WHATSAPP_ADMIN_TEMPLATE || "admin_new_order",
    params: [
      { type: "text", text: customerName },
      { type: "text", text: order.shippingAddress.phone || "N/A" },
      { type: "text", text: order.shippingAddress.email || "N/A" },
      { type: "text", text: addressFormatted },
      { type: "text", text: productsSummary },
      { type: "text", text: formatCurrency(order.totalAmount) },
      { type: "text", text: order.paymentStatus },
      { type: "text", text: order.paymentMethod },
      { type: "text", text: shortId },
      { type: "text", text: new Date().toLocaleString("en-IN") },
    ],
    label: "Admin new-order WhatsApp",
  });
};

/**
 * Send ALL notifications after order placement.
 */
const sendAllOrderNotifications = async (order) => {
  const shortId = order._id.toString().slice(-8).toUpperCase();
  console.log(`📢 Sending order placement notifications for order #${shortId}`);

  const steps = [
    { name: "Customer Email", fn: () => sendCustomerEmail(order) },
    { name: "Admin Email", fn: () => sendAdminEmail(order) },
    { name: "Customer WhatsApp", fn: () => sendCustomerWhatsApp(order) },
    { name: "Admin WhatsApp", fn: () => sendAdminWhatsApp(order) },
  ];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const results = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (i > 0) await delay(1000);

    try {
      const result = await step.fn();
      if (result && result.success) {
        results.push({ channel: step.name, status: "sent", reference: result.messageId || null });
      } else {
        results.push({ channel: step.name, status: "skipped", message: result?.message });
      }
    } catch (err) {
      results.push({ channel: step.name, status: "failed", message: err.message });
    }
  }

  return results;
};

/**
 * Shared info table rows for cancellation email
 */
const buildCancellationInfoRows = (order) => {
  const shortId = order._id.toString().slice(-8).toUpperCase();
  return `
    <tr>
      <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
      <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${shortId}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0;"><strong>Order Date:</strong></td>
      <td style="text-align: right;">${new Date(order.orderDate).toLocaleDateString("en-IN")}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0;"><strong>Payment Method:</strong></td>
      <td style="text-align: right;">${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</td>
    </tr>
    ${
      order.cancellationReason
        ? `<tr>
            <td style="padding: 4px 0;"><strong>Cancellation Reason:</strong></td>
            <td style="text-align: right; font-style: italic; color: #777;">${order.cancellationReason}</td>
          </tr>`
        : ""
    }`;
};

/**
 * Send Customer Email — Order Cancelled
 */
const sendCustomerCancellationEmail = async (order) => {
  try {
    const emailConfig = sendEmail.getValidatedEmailConfig ? sendEmail.getValidatedEmailConfig() : null;
    if (!emailConfig || emailConfig.provider === "mock") {
      console.warn("⚠️  Email provider not configured. Skipping customer cancellation email.");
      return { success: false, message: "Email provider not configured" };
    }

    if (emailConfig.provider === "smtp" && process.env.NODE_ENV === "production") {
      console.warn("⚠️  SMTP provider in production (Render blocks ports 465/587).");
      return { success: false, message: "SMTP not supported in production on Render" };
    }

    const isOnline = order.paymentMethod !== "COD";

    const refundBlock = isOnline
      ? `<div style="margin: 20px 24px; padding: 16px 20px; background: #E6F7FF; border-radius: 12px; border: 1px solid #b3e0f7;">
          <p style="color: #333; font-size: 14px; margin: 0 0 6px; font-weight: 700;">Your order has been cancelled successfully.</p>
          <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.6;">
            A full refund of <strong style="color: #0A77B7;">${formatCurrency(order.totalAmount)}</strong> has been initiated.<br>
            The amount will be credited to your original payment method within 5-7 business days.
          </p>
        </div>`
      : `<div style="margin: 20px 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
          <p style="color: #333; font-size: 14px; margin: 0 0 6px; font-weight: 700;">Your order has been cancelled successfully.</p>
          <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.6;">
            Since this order was Cash on Delivery, no refund was required.
          </p>
        </div>`;

    const contentHTML = `
      <div style="margin: 0 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          ${buildCancellationInfoRows(order)}
        </table>
      </div>

      ${refundBlock}

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
            ${generateProductsHTML(order.products)}
          </tbody>
        </table>
      </div>`;

    const html = buildBrandedEmail({
      badge: "❌",
      title: "Order Cancelled",
      subtitle: `We're sorry to see you go, <strong>${order.shippingAddress.fullName}</strong>.`,
      contentHTML,
      footerText: "AquaPure — Order Cancellation Notice",
    });

    const info = await sendEmail({
      to: order.shippingAddress.email,
      subject: "Order Cancelled Successfully - AquaPure",
      html,
    });

    console.log("📧 Customer cancellation email sent:", info?.messageId || "Dispatched");
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("❌ Customer cancellation email failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send Customer WhatsApp — Order Cancelled
 */
const sendCustomerCancellationWhatsApp = async (order) => {
  const isOnline = order.paymentMethod !== "COD";
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const customerName = order.shippingAddress.fullName;
  const phone = order.shippingAddress.phone;

  if (isOnline) {
    return sendWhatsAppMessage({
      to: phone,
      templateName: process.env.WHATSAPP_CANCELLATION_TEMPLATE,
      params: [
        { type: "text", text: customerName },
        { type: "text", text: orderId },
        { type: "text", text: formatCurrency(order.totalAmount) },
        { type: "text", text: order.refundStatus || "Initiated" },
        { type: "text", text: "5-7 business days" },
      ],
      label: "Customer cancellation WhatsApp (online)",
    });
  }

  return sendWhatsAppMessage({
    to: phone,
    templateName: process.env.WHATSAPP_CANCELLATION_COD_TEMPLATE,
    params: [
      { type: "text", text: customerName },
      { type: "text", text: orderId },
    ],
    label: "Customer cancellation WhatsApp (COD)",
  });
};

/**
 * Send Admin Email — Order Cancelled by Customer
 */
const sendAdminCancellationEmail = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.COMPANY_EMAIL;

    if (!adminEmail) {
      console.warn("⚠️  Admin email not configured. Skipping admin cancellation email.");
      return { success: false, message: "Admin email not configured" };
    }

    const emailConfig = sendEmail.getValidatedEmailConfig ? sendEmail.getValidatedEmailConfig() : null;
    if (!emailConfig || emailConfig.provider === "mock") {
      console.warn("⚠️  Email provider not configured. Skipping admin cancellation email.");
      return { success: false, message: "Email provider not configured" };
    }

    if (emailConfig.provider === "smtp" && process.env.NODE_ENV === "production") {
      console.warn("⚠️  SMTP provider in production (Render blocks ports 465/587).");
      return { success: false, message: "SMTP not supported in production on Render" };
    }

    const contentHTML = `
      <div style="margin: 0 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          <tr>
            <td style="padding: 4px 0;"><strong>Customer Name:</strong></td>
            <td style="text-align: right;">${order.shippingAddress.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Total Amount:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #0A77B7;">${formatCurrency(order.totalAmount)}</td>
          </tr>
        </table>
      </div>`;

    const html = buildBrandedEmail({
      badge: "❌",
      title: "Order Cancelled by Customer",
      subtitle: `Customer #${order._id.toString().slice(-8).toUpperCase()} requested cancellation.`,
      contentHTML,
      footerText: "AquaPure — Admin Notification",
    });

    const info = await sendEmail({
      to: adminEmail,
      subject: `Order Cancelled by Customer — #${order._id.toString().slice(-8).toUpperCase()}`,
      html,
    });

    console.log("📧 Admin cancellation email sent:", info?.messageId || "Dispatched");
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("❌ Admin cancellation email failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send Admin WhatsApp — Order Cancelled
 */
const sendAdminCancellationWhatsApp = async (order) => {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
  if (!adminPhone) {
    console.warn("⚠️  ADMIN_WHATSAPP_NUMBER not configured. Skipping admin cancellation WhatsApp.");
    return { success: false, message: "Admin WhatsApp not configured" };
  }

  return sendWhatsAppMessage({
    to: adminPhone,
    templateName: process.env.WHATSAPP_ADMIN_CANCELLATION_TEMPLATE,
    params: [
      { type: "text", text: order.shippingAddress.fullName },
      { type: "text", text: order.shippingAddress.phone },
      { type: "text", text: order._id.toString().slice(-8).toUpperCase() },
      { type: "text", text: formatCurrency(order.totalAmount) },
      { type: "text", text: order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod },
      { type: "text", text: order.refundStatus || "None" },
    ],
    label: "Admin cancellation WhatsApp",
  });
};

/**
 * Send ALL notifications after an order is cancelled.
 */
const sendAllCancellationNotifications = async (order) => {
  const shortId = order._id.toString().slice(-8).toUpperCase();
  console.log(`📢 Sending cancellation notifications for order #${shortId}`);

  const steps = [
    { name: "Admin Email", fn: () => sendAdminCancellationEmail(order) },
    { name: "Customer Email", fn: () => sendCustomerCancellationEmail(order) },
    { name: "Customer WhatsApp", fn: () => sendCustomerCancellationWhatsApp(order) },
    { name: "Admin WhatsApp", fn: () => sendAdminCancellationWhatsApp(order) },
  ];

  const results = [];
  for (const step of steps) {
    try {
      const result = await step.fn();
      if (result && result.success) {
        results.push({ channel: step.name, status: "sent", reference: result.messageId || null });
      } else {
        results.push({ channel: step.name, status: "skipped", message: result?.message });
      }
    } catch (err) {
      results.push({ channel: step.name, status: "failed", message: err.message });
    }
  }

  return results;
};

/**
 * Send Customer Email — Refund Completed
 */
const sendRefundCompletedEmail = async (order) => {
  try {
    const emailConfig = sendEmail.getValidatedEmailConfig ? sendEmail.getValidatedEmailConfig() : null;
    if (!emailConfig || emailConfig.provider === "mock") {
      console.warn("⚠️  Email provider not configured. Skipping refund-completed email.");
      return { success: false, message: "Email provider not configured" };
    }

    if (emailConfig.provider === "smtp" && process.env.NODE_ENV === "production") {
      console.warn("⚠️  SMTP provider in production (Render blocks ports 465/587).");
      return { success: false, message: "SMTP not supported in production on Render" };
    }

    const contentHTML = `
      <div style="margin: 0 24px; padding: 16px 20px; background: #E6F7FF; border-radius: 12px; border: 1px solid #b3e0f7;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          <tr>
            <td style="padding: 6px 0;"><strong>Refund Amount:</strong></td>
            <td style="text-align: right; font-weight: 800; font-size: 18px; color: #0A77B7;">${formatCurrency(order.refundAmount || order.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
          </tr>
        </table>
      </div>`;

    const html = buildBrandedEmail({
      badge: "💸",
      title: "Refund Completed",
      subtitle: `Hello <strong>${order.shippingAddress.fullName}</strong> — great news!`,
      contentHTML,
      footerText: "AquaPure — Refund Notification",
    });

    const info = await sendEmail({
      to: order.shippingAddress.email,
      subject: "Refund Completed - AquaPure",
      html,
    });

    console.log("📧 Refund-completed email sent:", info?.messageId || "Dispatched");
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("❌ Refund-completed email failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send Customer WhatsApp — Refund Completed
 */
const sendRefundCompletedWhatsApp = async (order) => {
  return sendWhatsAppMessage({
    to: order.shippingAddress.phone,
    templateName: process.env.WHATSAPP_REFUND_COMPLETED_TEMPLATE,
    params: [
      { type: "text", text: order.shippingAddress.fullName },
      { type: "text", text: formatCurrency(order.refundAmount || order.totalAmount) },
      { type: "text", text: order._id.toString().slice(-8).toUpperCase() },
    ],
    label: "Refund-completed WhatsApp",
  });
};

/**
 * Send refund-completed notifications
 */
const sendRefundCompletedNotifications = async (order) => {
  const shortId = order._id.toString().slice(-8).toUpperCase();
  console.log(`💸 Sending refund-completed notifications for order #${shortId}`);

  const steps = [
    { name: "Refund Customer Email", fn: () => sendRefundCompletedEmail(order) },
    { name: "Refund Customer WhatsApp", fn: () => sendRefundCompletedWhatsApp(order) },
  ];

  const results = [];
  for (const step of steps) {
    try {
      const result = await step.fn();
      if (result && result.success) {
        results.push({ channel: step.name, status: "sent", reference: result.messageId || null });
      } else {
        results.push({ channel: step.name, status: "skipped", message: result?.message });
      }
    } catch (err) {
      results.push({ channel: step.name, status: "failed", message: err.message });
    }
  }

  return results;
};

module.exports = {
  sendAllOrderNotifications,
  sendCustomerEmail,
  sendAdminEmail,
  sendAdminWhatsApp,
  sendAllCancellationNotifications,
  sendCustomerCancellationEmail,
  sendCustomerCancellationWhatsApp,
  sendAdminCancellationEmail,
  sendAdminCancellationWhatsApp,
  sendRefundCompletedNotifications,
  sendRefundCompletedEmail,
  sendRefundCompletedWhatsApp,
};