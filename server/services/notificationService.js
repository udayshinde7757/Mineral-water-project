/**
 * Notification Service — Handles all order-related notifications
 * Supports: Customer Email, Customer WhatsApp, Admin Email, Admin WhatsApp
 */

const { sendOrderConfirmationEmail } = require("./emailService");
const { sendOrderConfirmationSMS } = require("./smsService");
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
 * Send Customer Email Notification
 */
const sendCustomerEmail = async (order) => {
  try {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.warn("⚠️  SMTP credentials not configured. Skipping customer email.");
      return { success: false, message: "SMTP not configured" };
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

    const mailOptions = {
      from: `"AquaPure" <${process.env.SMTP_EMAIL}>`,
      to: order.shippingAddress.email,
      subject: `✅ AquaPure Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
      html,
    };

    const transporter = require("nodemailer").createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Customer email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Customer email failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send Customer WhatsApp Notification (Meta WhatsApp Business Cloud API)
 */
const sendCustomerWhatsApp = async (order) => {
  try {
    const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_NAME } = process.env;

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.warn("⚠️  WhatsApp credentials not configured. Skipping customer WhatsApp.");
      return { success: false, message: "WhatsApp not configured" };
    }

    const orderId = order._id.toString().slice(-8).toUpperCase();
    const productsText = generateProductsWhatsApp(order.products);
    const estimatedDate = getEstimatedDeliveryString(order);

    // Format phone number
    let phoneNumber = order.shippingAddress.phone;
    phoneNumber = phoneNumber.replace(/\D/g, "");
    if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
      phoneNumber = "91" + phoneNumber;
    }

    // Use template or custom message
    const templateName = WHATSAPP_TEMPLATE_NAME || "order_confirmation";
    
    const templateParams = [
      { type: "text", text: order.shippingAddress.fullName }, // {{1}} - Customer name
      { type: "text", text: orderId }, // {{2}} - Order ID
      { type: "text", text: productsText }, // {{3}} - Products
      { type: "text", text: formatCurrency(order.totalAmount) }, // {{4}} - Total
      { type: "text", text: estimatedDate }, // {{5}} - Estimated delivery
    ];

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
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

    console.log("📱 Customer WhatsApp sent:", data.messages?.[0]?.id);
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error("❌ Customer WhatsApp failed:", error.message);
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

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.warn("⚠️  SMTP credentials not configured. Skipping admin email.");
      return { success: false, message: "SMTP not configured" };
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

    const transporter = require("nodemailer").createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"AquaPure Admin" <${process.env.SMTP_EMAIL}>`,
      to: adminEmail,
      subject: `🔔 New AquaPure Order — #${order._id.toString().slice(-8).toUpperCase()} — ${formatCurrency(order.totalAmount)}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Admin email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Admin email failed:", error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send Admin WhatsApp Notification
 */
const sendAdminWhatsApp = async (order) => {
  try {
    const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ADMIN_WHATSAPP_NUMBER, WHATSAPP_ADMIN_TEMPLATE } = process.env;

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !ADMIN_WHATSAPP_NUMBER) {
      console.warn("⚠️  Admin WhatsApp not fully configured. Skipping.");
      return { success: false, message: "Admin WhatsApp not configured" };
    }

    const orderId = order._id.toString().slice(-8).toUpperCase();
    const productsText = generateProductsWhatsApp(order.products);
    const addressFormatted = formatAddress(order.shippingAddress);

    // Format admin phone number
    let adminPhone = ADMIN_WHATSAPP_NUMBER.replace(/\D/g, "");
    if (!adminPhone.startsWith("91") && adminPhone.length === 10) {
      adminPhone = "91" + adminPhone;
    }

    const templateName = WHATSAPP_ADMIN_TEMPLATE || "admin_new_order";

    const templateParams = [
      { type: "text", text: order.shippingAddress.fullName }, // {{1}} Customer name
      { type: "text", text: order.shippingAddress.phone }, // {{2}} Phone
      { type: "text", text: order.shippingAddress.email }, // {{3}} Email
      { type: "text", text: addressFormatted }, // {{4}} Address
      { type: "text", text: productsText }, // {{5}} Products
      { type: "text", text: formatCurrency(order.totalAmount) }, // {{6}} Total
      { type: "text", text: order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod }, // {{7}} Payment method
      { type: "text", text: orderId }, // {{8}} Order ID
    ];

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
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
 * Send ALL notifications for a new order
 * This is the main function called from order controller
 */
const sendAllOrderNotifications = async (order) => {
  console.log(`📢 Sending notifications for order #${order._id.toString().slice(-8).toUpperCase()}`);

  // Send all notifications in parallel (non-blocking)
  const results = await Promise.allSettled([
    sendCustomerEmail(order),
    sendCustomerWhatsApp(order),
    sendAdminEmail(order),
    sendAdminWhatsApp(order),
  ]);

  // Log results
  const notificationTypes = ["Customer Email", "Customer WhatsApp", "Admin Email", "Admin WhatsApp"];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      if (result.value.success) {
        console.log(`✅ ${notificationTypes[index]}: Sent successfully`);
      } else {
        console.warn(`⚠️ ${notificationTypes[index]}: ${result.value.message}`);
      }
    } else {
      console.error(`❌ ${notificationTypes[index]}: Failed - ${result.reason?.message}`);
    }
  });

  return results;
};

module.exports = {
  sendAllOrderNotifications,
  sendCustomerEmail,
  sendCustomerWhatsApp,
  sendAdminEmail,
  sendAdminWhatsApp,
};