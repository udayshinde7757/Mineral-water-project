/**
 * Notification Service — Handles all order-related notifications
 * Supports: Customer Email, Customer WhatsApp, Admin Email, Admin WhatsApp
 */

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
  }).format(amount);
};

/**
 * Generate HTML table for order products
 */
const generateProductsHTML = (products) => {
  return products
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
};

/**
 * Generate product list for WhatsApp
 */
const generateProductsWhatsApp = (products) => {
  return products
    .map((item) => `• ${item.name} × ${item.quantity} — ${formatCurrency(item.price * item.quantity)}`)
    .join("\n");
};

/**
 * Format address for display
 */
const formatAddress = (address) => {
  return `${address.fullName}
${address.addressLine1}${address.addressLine2 ? ", " + address.addressLine2 : ""}
${address.city}, ${address.state} — ${address.pincode}
${address.country}
📱 ${address.phone}`;
};

/**
 * Get estimated delivery date string
 */
const getEstimatedDeliveryString = (order) => {
  if (!order.estimatedDelivery) return "3-5 business days";
  return new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Helper to build Nodemailer transport with fallback credentials,
 * port 465 SSL default, and connection timeouts for cloud environments (Render).
 */
const createSmtpTransporter = () => {
  const user = process.env.SMTP_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : port === 465;

  return {
    user,
    transporter: require("nodemailer").createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      socketTimeout: 15000,
      greetingTimeout: 10000,
    }),
  };
};

/**
 * Send Customer Email Notification
 */
const sendCustomerEmail = async (order) => {
  try {
    const smtp = createSmtpTransporter();
    if (!smtp) {
      console.warn("⚠️  SMTP credentials not configured (SMTP_EMAIL / SMTP_PASSWORD missing). Skipping customer email.");
      return { success: false, message: "SMTP credentials not configured in environment" };
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

    const fromAddress = process.env.EMAIL_FROM || `"AquaPure" <${smtp.user}>`;

    const mailOptions = {
      from: fromAddress,
      to: order.shippingAddress.email,
      subject: `✅ AquaPure Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
      html,
    };

    const info = await smtp.transporter.sendMail(mailOptions);
    console.log("📧 Customer email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Customer email failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
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
      console.warn("⚠️  Admin email not configured (ADMIN_EMAIL / COMPANY_EMAIL missing). Skipping admin email.");
      return { success: false, message: "Admin email not configured in environment" };
    }

    const smtp = createSmtpTransporter();
    if (!smtp) {
      console.warn("⚠️  SMTP credentials not configured (SMTP_EMAIL / SMTP_PASSWORD missing). Skipping admin email.");
      return { success: false, message: "SMTP credentials not configured in environment" };
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
              <td style="padding: 6px 0;"><strong>Order Date:</strong></td>
              <td style="text-align: right;">${new Date(order.orderDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
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
            <tr>
              <td style="padding: 6px 0;"><strong>Order Status:</strong></td>
              <td style="text-align: right; font-weight: 600; color: #0A77B7;">${order.orderStatus}</td>
            </tr>
          </table>
        </div>

        <!-- Customer Details -->
        <div style="padding: 24px; background: #f8fafb; border-bottom: 1px solid #f0f0f0;">
          <h3 style="color: #333; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #0A77B7; padding-bottom: 8px; display: inline-block;">👤 Customer Details</h3>
          <table style="width: 100%; font-size: 13px; color: #555; margin-top: 8px;">
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
          <p style="color: #555; font-size: 13px; margin: 12px 0 0; line-height: 1.6; white-space: pre-line;">${addressFormatted}</p>
        </div>

        <!-- Products -->
        <div style="padding: 24px; background: #fff;">
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
          <h3 style="color: #333; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #0A77B7; padding-bottom: 8px; display: inline-block;">💰 Payment Summary</h3>
          <table style="width: 100%; font-size: 13px; color: #555; margin-top: 12px;">
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
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">AquaPure Admin Notification</p>
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 4px 0 0;">Please process this order promptly.</p>
        </div>
      </div>
    </body>
    </html>`;

    const fromAddress = process.env.EMAIL_FROM || `"AquaPure Admin" <${smtp.user}>`;

    const mailOptions = {
      from: fromAddress,
      to: adminEmail,
      subject: `🔔 New AquaPure Order — #${order._id.toString().slice(-8).toUpperCase()} — ${formatCurrency(order.totalAmount)}`,
      html,
    };

    const info = await smtp.transporter.sendMail(mailOptions);
    console.log("📧 Admin email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Admin email failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    return { success: false, message: error.message };
  }
};

/**
 * Send Admin WhatsApp Notification
 */
const sendAdminWhatsApp = async (order) => {
  try {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ADMIN_WHATSAPP_NUMBER, WHATSAPP_ADMIN_TEMPLATE } = process.env;

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !ADMIN_WHATSAPP_NUMBER) {
      console.warn("⚠️  Admin WhatsApp not fully configured. Skipping.");
      return { success: false, message: "Admin WhatsApp not configured" };
    }

    const orderId = order._id.toString().slice(-8).toUpperCase();
    const productsText = generateProductsWhatsApp(order.products);
    const addressFormatted = formatAddress(order.shippingAddress);
    const orderDateTime = new Date(order.orderDate || Date.now()).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Format admin phone number
    let adminPhone = ADMIN_WHATSAPP_NUMBER.replace(/\D/g, "");
    if (!adminPhone.startsWith("91") && adminPhone.length === 10) {
      adminPhone = "91" + adminPhone;
    }

    const templateName = WHATSAPP_ADMIN_TEMPLATE || "admin_new_order";

    // Expected template placeholders (update your Meta template to match):
    // {{1}} Customer name | {{2}} Phone | {{3}} Email | {{4}} Address
    // {{5}} Products | {{6}} Total | {{7}} Payment status | {{8}} Payment method
    // {{9}} Order ID | {{10}} Date & time
    const templateParams = [
      { type: "text", text: order.shippingAddress.fullName }, // {{1}} Customer name
      { type: "text", text: order.shippingAddress.phone }, // {{2}} Phone
      { type: "text", text: order.shippingAddress.email }, // {{3}} Email
      { type: "text", text: addressFormatted }, // {{4}} Address
      { type: "text", text: productsText }, // {{5}} Products
      { type: "text", text: formatCurrency(order.totalAmount) }, // {{6}} Total
      { type: "text", text: order.paymentStatus }, // {{7}} Payment status
      { type: "text", text: order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod }, // {{8}} Payment method
      { type: "text", text: orderId }, // {{9}} Order ID
      { type: "text", text: orderDateTime }, // {{10}} Date & time
    ];

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminPhone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: templateParams,
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "WhatsApp API error");
    }

    console.log("📱 Admin WhatsApp sent:", data.messages?.[0]?.id);
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error("❌ Admin WhatsApp failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send ALL notifications for a new order.
 * This is the main function called from order controllers.
 *
 * Channels run SEQUENTIALLY in the required order:
 *   1. Owner Email
 *   2. Customer Email
 *   3. Customer WhatsApp (WhatsApp Cloud API)
 *   4. Owner WhatsApp
 *
 * Every step is isolated — a failure in one channel is logged and the next
 * channel still runs. Notifications NEVER fail or roll back the order.
 */
const sendAllOrderNotifications = async (order) => {
  const shortId = order._id.toString().slice(-8).toUpperCase();
  console.log(`📢 Sending notifications for order #${shortId}`);

  const steps = [
    { name: "Owner Email", fn: () => sendAdminEmail(order) },
    { name: "Customer Email", fn: () => sendCustomerEmail(order) },
    { name: "Customer WhatsApp", fn: () => sendOrderPlacedMessage(order) },
    { name: "Owner WhatsApp", fn: () => sendAdminWhatsApp(order) },
  ];

  const results = [];

  for (const step of steps) {
    try {
      const result = await step.fn();
      if (result && result.success) {
        console.log(`✅ ${step.name}: Sent successfully`);
        results.push({
          channel: step.name,
          status: "sent",
          reference: result.messageId || result.messageSid || null,
        });
      } else {
        console.warn(`⚠️ ${step.name}: ${result?.message || "unknown error"}`);
        results.push({ channel: step.name, status: "skipped", message: result?.message });
      }
    } catch (err) {
      console.error(`❌ ${step.name}: Failed - ${err.message}`);
      results.push({ channel: step.name, status: "failed", message: err.message });
    }
  }

  console.log(
    `📬 Notification summary for order #${shortId}:`,
    results.map((r) => `${r.channel}=${r.status}`).join(", ")
  );

  return results;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER CANCELLATION + REFUND NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AquaPure support email shown to customers in emails.
 */
const getSupportEmail = () => {
  return process.env.AQUAPURE_SUPPORT_EMAIL || "support@aquapure.com";
};

/**
 * Long date formatter (e.g. "31 July 2026").
 */
const formatDateLong = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Reusable Meta WhatsApp Business Cloud API sender for template messages.
 */
const sendWhatsAppMessage = async ({ to, templateName, params, label = "WhatsApp" }) => {
  try {
    const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.warn(`⚠️  WhatsApp credentials not configured. Skipping ${label}.`);
      return { success: false, message: "WhatsApp not configured" };
    }

    if (!templateName) {
      console.warn(`⚠️  No WhatsApp template name configured for ${label}. Skipping.`);
      return { success: false, message: "WhatsApp template not configured" };
    }

    // Format phone number with country code
    let phoneNumber = String(to).replace(/\D/g, "");
    if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
      phoneNumber = "91" + phoneNumber;
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [{ type: "body", parameters: params }],
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "WhatsApp API error");
    }

    console.log(`📱 ${label} sent:`, data.messages?.[0]?.id);
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error(`❌ ${label} failed:`, error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Branded AquaPure email shell used by all cancellation/refund emails.
 */
const buildBrandedEmail = ({ badge, title, subtitle, contentHTML, footerText }) => {
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

      <!-- Badge & Title -->
      <div style="text-align: center; padding: 32px 24px 16px;">
        <div style="display: inline-block; background: #E6F7FF; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">${badge}</div>
        <h2 style="color: #333; margin: 16px 0 4px; font-size: 22px;">${title}</h2>
        ${subtitle ? `<p style="color: #777; margin: 0; font-size: 14px;">${subtitle}</p>` : ""}
      </div>

      ${contentHTML}

      <!-- Footer -->
      <div style="background: #333; padding: 24px; text-align: center; margin-top: 20px;">
        <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">${footerText}</p>
        <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 8px 0 0;">© ${new Date().getFullYear()} AquaPure. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;
};

/**
 * Shared info table rows for the customer cancellation email.
 */
const buildCancellationInfoRows = (order) => {
  const refundStatus = order.refundStatus || "None";
  const statusColor =
    refundStatus === "Completed" ? "#00B8A9" : refundStatus === "Failed" ? "#ef4444" : "#f59e0b";

  return `
    <tr>
      <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
      <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0;"><strong>Order Date:</strong></td>
      <td style="text-align: right;">${formatDateLong(order.orderDate)}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0;"><strong>Cancelled Date:</strong></td>
      <td style="text-align: right;">${formatDateLong(order.cancelledAt || Date.now())}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0;"><strong>Payment Method:</strong></td>
      <td style="text-align: right;">${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0;"><strong>Refund Status:</strong></td>
      <td style="text-align: right;">
        <span style="background: ${statusColor}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;">
          ${refundStatus}
        </span>
      </td>
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
 * Send Customer Email — Order Cancelled (subject: "Order Cancelled Successfully - AquaPure")
 */
const sendCustomerCancellationEmail = async (order) => {
  try {
    const smtp = createSmtpTransporter();
    if (!smtp) {
      console.warn("⚠️  SMTP credentials not configured (SMTP_EMAIL / SMTP_PASSWORD missing). Skipping customer cancellation email.");
      return { success: false, message: "SMTP credentials not configured in environment" };
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
      <!-- Order Info -->
      <div style="margin: 0 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          ${buildCancellationInfoRows(order)}
        </table>
      </div>

      ${refundBlock}

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
            ${generateProductsHTML(order.products)}
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

      <!-- Support -->
      <div style="margin: 20px 24px; text-align: center; padding: 16px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <p style="color: #555; font-size: 13px; margin: 0;">Thank you for choosing AquaPure.</p>
        <p style="color: #999; font-size: 12px; margin: 8px 0 0;">Need help? <a href="mailto:${getSupportEmail()}" style="color: #0A77B7; font-weight: 700; text-decoration: none;">${getSupportEmail()}</a></p>
      </div>`;

    const html = buildBrandedEmail({
      badge: "❌",
      title: "Order Cancelled",
      subtitle: `We're sorry to see you go, <strong>${order.shippingAddress.fullName}</strong>.`,
      contentHTML,
      footerText: "AquaPure — Order Cancellation Notice",
    });

    const fromAddress = process.env.EMAIL_FROM || `"AquaPure" <${smtp.user}>`;

    const info = await smtp.transporter.sendMail({
      from: fromAddress,
      to: order.shippingAddress.email,
      subject: "Order Cancelled Successfully - AquaPure",
      html,
    });

    console.log("📧 Customer cancellation email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Customer cancellation email failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    return { success: false, message: error.message };
  }
};

/**
 * Send Customer WhatsApp — Order Cancelled.
 * Online orders use a template with refund details; COD uses a simpler one.
 */
const sendCustomerCancellationWhatsApp = async (order) => {
  const isOnline = order.paymentMethod !== "COD";
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const customerName = order.shippingAddress.fullName;
  const phone = order.shippingAddress.phone;

  if (isOnline) {
    // Template placeholders:
    //   {{1}} Customer name | {{2}} Order ID | {{3}} Refund amount
    //   {{4}} Refund status | {{5}} Expected credit timeframe
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

  // COD template placeholders: {{1}} Customer name | {{2}} Order ID
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
 * Send Admin Email — Order Cancelled by Customer.
 */
const sendAdminCancellationEmail = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.COMPANY_EMAIL;

    if (!adminEmail) {
      console.warn("⚠️  Admin email not configured (ADMIN_EMAIL / COMPANY_EMAIL missing). Skipping admin cancellation email.");
      return { success: false, message: "Admin email not configured in environment" };
    }

    const smtp = createSmtpTransporter();
    if (!smtp) {
      console.warn("⚠️  SMTP credentials not configured (SMTP_EMAIL / SMTP_PASSWORD missing). Skipping admin cancellation email.");
      return { success: false, message: "SMTP credentials not configured in environment" };
    }

    const contentHTML = `
      <!-- Customer & Order Details -->
      <div style="margin: 0 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          <tr>
            <td style="padding: 4px 0;"><strong>Customer Name:</strong></td>
            <td style="text-align: right;">${order.shippingAddress.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Customer Email:</strong></td>
            <td style="text-align: right;">${order.shippingAddress.email}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Customer Phone:</strong></td>
            <td style="text-align: right;">${order.shippingAddress.phone}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Total Amount:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #0A77B7;">${formatCurrency(order.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Payment Method:</strong></td>
            <td style="text-align: right;">${order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Refund Status:</strong></td>
            <td style="text-align: right;">${order.refundStatus || "None"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Cancellation Time:</strong></td>
            <td style="text-align: right;">${new Date(order.cancelledAt || Date.now()).toLocaleString("en-IN")}</td>
          </tr>
          ${
            order.cancellationReason
              ? `<tr>
                  <td style="padding: 4px 0;"><strong>Reason:</strong></td>
                  <td style="text-align: right; font-style: italic; color: #777;">${order.cancellationReason}</td>
                </tr>`
              : ""
          }
        </table>
      </div>

      <!-- Products -->
      <div style="margin: 20px 24px;">
        <h3 style="color: #333; font-size: 15px; margin-bottom: 12px;">📦 Products Cancelled</h3>
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
      title: "Order Cancelled by Customer",
      subtitle: `Customer #${order._id.toString().slice(-8).toUpperCase()} requested cancellation.`,
      contentHTML,
      footerText: "AquaPure — Admin Notification",
    });

    const fromAddress = process.env.EMAIL_FROM || `"AquaPure Admin" <${smtp.user}>`;

    const info = await smtp.transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `Order Cancelled by Customer — #${order._id.toString().slice(-8).toUpperCase()}`,
      html,
    });

    console.log("📧 Admin cancellation email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Admin cancellation email failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    return { success: false, message: error.message };
  }
};

/**
 * Send Admin WhatsApp — Order Cancelled.
 * Template placeholders:
 *   {{1}} Customer name | {{2}} Phone | {{3}} Order ID | {{4}} Amount
 *   {{5}} Payment method | {{6}} Refund status
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
 * Send Customer Email — Refund Completed (subject: "Refund Completed - AquaPure")
 */
const sendRefundCompletedEmail = async (order) => {
  try {
    const smtp = createSmtpTransporter();
    if (!smtp) {
      console.warn("⚠️  SMTP credentials not configured (SMTP_EMAIL / SMTP_PASSWORD missing). Skipping refund-completed email.");
      return { success: false, message: "SMTP credentials not configured in environment" };
    }

    const contentHTML = `
      <div style="margin: 0 24px; padding: 16px 20px; background: #E6F7FF; border-radius: 12px; border: 1px solid #b3e0f7;">
        <table style="width: 100%; font-size: 13px; color: #555;">
          <tr>
            <td style="padding: 6px 0;"><strong>Refund Amount:</strong></td>
            <td style="text-align: right; font-weight: 800; font-size: 18px; color: #0A77B7;">${formatCurrency(order.refundAmount || order.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Refund ID:</strong></td>
            <td style="text-align: right; font-family: monospace; color: #0A77B7;">${order.refundId || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;"><strong>Order ID:</strong></td>
            <td style="text-align: right; font-weight: 700; color: #0A77B7;">#${order._id.toString().slice(-8).toUpperCase()}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 20px 24px; padding: 16px 20px; background: #f8fafb; border-radius: 12px; border: 1px solid #e8ecef;">
        <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.6;">
          The amount has been credited to your original payment method.<br>
          Thank you for shopping with AquaPure.
        </p>
      </div>

      <div style="margin: 20px 24px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">Need help? <a href="mailto:${getSupportEmail()}" style="color: #0A77B7; font-weight: 700; text-decoration: none;">${getSupportEmail()}</a></p>
      </div>`;

    const html = buildBrandedEmail({
      badge: "💸",
      title: "Refund Completed",
      subtitle: `Hello <strong>${order.shippingAddress.fullName}</strong> — great news!`,
      contentHTML,
      footerText: "AquaPure — Refund Notification",
    });

    const fromAddress = process.env.EMAIL_FROM || `"AquaPure" <${smtp.user}>`;

    const info = await smtp.transporter.sendMail({
      from: fromAddress,
      to: order.shippingAddress.email,
      subject: "Refund Completed - AquaPure",
      html,
    });

    console.log("📧 Refund-completed email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Refund-completed email failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    return { success: false, message: error.message };
  }
};

/**
 * Send Customer WhatsApp — Refund Completed.
 * Template placeholders: {{1}} Customer name | {{2}} Amount | {{3}} Order ID
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
 * Send ALL notifications after an order is cancelled.
 * Sequential & isolated: a failure in one channel never blocks the next.
 *   1. Admin Email | 2. Customer Email | 3. Customer WhatsApp | 4. Admin WhatsApp
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
        console.log(`✅ ${step.name}: Sent successfully`);
        results.push({ channel: step.name, status: "sent", reference: result.messageId || null });
      } else {
        console.warn(`⚠️ ${step.name}: ${result?.message || "unknown error"}`);
        results.push({ channel: step.name, status: "skipped", message: result?.message });
      }
    } catch (err) {
      console.error(`❌ ${step.name}: Failed - ${err.message}`);
      results.push({ channel: step.name, status: "failed", message: err.message });
    }
  }

  console.log(
    `📬 Cancellation notification summary for order #${shortId}:`,
    results.map((r) => `${r.channel}=${r.status}`).join(", ")
  );

  return results;
};

/**
 * Send refund-completed notifications (customer email + customer WhatsApp).
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
        console.log(`✅ ${step.name}: Sent successfully`);
        results.push({ channel: step.name, status: "sent", reference: result.messageId || null });
      } else {
        console.warn(`⚠️ ${step.name}: ${result?.message || "unknown error"}`);
        results.push({ channel: step.name, status: "skipped", message: result?.message });
      }
    } catch (err) {
      console.error(`❌ ${step.name}: Failed - ${err.message}`);
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