/**
 * WhatsApp Notification Service — Meta WhatsApp Cloud API
 *
 * Sends customer order notifications over WhatsApp using the Meta WhatsApp
 * Business Cloud API (graph.facebook.com). No third-party SDK required —
 * plain HTTP requests via fetch.
 *
 * Configuration (environment variables):
 *   WHATSAPP_PHONE_NUMBER_ID    — numeric Phone Number ID (from WhatsApp → API Setup)
 *   WHATSAPP_ACCESS_TOKEN       — Graph API access token (starts with EAAG...)
 *   WHATSAPP_BUSINESS_ACCOUNT_ID — numeric WhatsApp Business Account ID
 *   WHATSAPP_API_BASE           — optional override (default https://graph.facebook.com/v21.0)
 *
 * Optional template names (per event). If set, a template message is sent
 * (required by WhatsApp for business-initiated messages outside a 24h window);
 * otherwise a free-form text message is used (delivers inside a session window).
 *   WHATSAPP_ORDER_PLACED_TEMPLATE
 *   WHATSAPP_OUT_FOR_DELIVERY_TEMPLATE
 *   WHATSAPP_ORDER_COMPLETED_TEMPLATE
 *   WHATSAPP_STATUS_TEMPLATE
 *
 * Every dispatch is recorded in the NotificationLog collection so failures can
 * be retried from the admin panel.
 */

const NotificationLog = require("../models/NotificationLog");
const SiteSettings = require("../models/SiteSettings");

/**
 * Resolve Cloud API config. Environment variables take priority; values stored
 * in the SiteSettings collection are used as a fallback.
 */
const getConfig = async () => {
  let settings = null;
  try {
    settings = await SiteSettings.findOne();
  } catch (err) {
    console.warn("[WhatsApp] Could not read SiteSettings:", err.message);
  }

  return {
    phoneNumberId:
      process.env.WHATSAPP_PHONE_NUMBER_ID || settings?.whatsappPhoneNumberId || "",
    accessToken:
      process.env.WHATSAPP_ACCESS_TOKEN || settings?.whatsappAccessToken || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    apiBase: process.env.WHATSAPP_API_BASE || "https://graph.facebook.com/v21.0",
  };
};

/**
 * Normalize a phone number to digits with country code (default India +91).
 */
const formatPhone = (phone) => {
  let p = String(phone || "").replace(/\D/g, "");
  if (p.length === 10) p = "91" + p; // local number → India
  if (!p.startsWith("91") && p.length === 12) p = "91" + p;
  return p;
};

/**
 * Shared order fields used across all message builders.
 */
const orderMeta = (order) => ({
  customerName: order.shippingAddress?.fullName || "Customer",
  shortId: (order._id ? order._id.toString().slice(-8) : "ORD").toUpperCase(),
  total: `₹${order.totalAmount}`,
  estimated: order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "3-4 Days",
  phone: formatPhone(order.shippingAddress?.phone),
});

/**
 * Record a dispatch attempt in the NotificationLog collection.
 */
const logNotification = async ({ recipient, event, orderId, customerName, messageText, status, error }) => {
  try {
    await NotificationLog.create({
      type: "WhatsApp",
      recipient,
      event,
      orderId: orderId || null,
      customerName,
      messageSnippet: (messageText || "").slice(0, 150) + (messageText && messageText.length > 150 ? "..." : ""),
      status,
      error: error || null,
      sentAt: new Date(),
    });
  } catch (dbErr) {
    console.error("[WhatsApp] Failed to record notification log:", dbErr.message);
  }
};

/**
 * Low-level WhatsApp Cloud API sender.
 * Sends a template message when templateName is provided, otherwise a
 * free-form text message.
 *
 * @param {Object}   opts
 * @param {string}   opts.to           - recipient phone (E.164 digits)
 * @param {string}   opts.text         - free-form text body
 * @param {string}   [opts.templateName]
 * @param {Array}    [opts.templateParams] - [{type:"text", text:"..."}, ...]
 * @param {string}   opts.label        - human-readable channel label for logs
 * @returns {Promise<{success:boolean, messageId?:string, message?:string}>}
 */
const sendCloudApiMessage = async ({ to, text, templateName, templateParams = [], label }) => {
  const { phoneNumberId, accessToken, businessAccountId, apiBase } = await getConfig();

  if (!phoneNumberId || !accessToken) {
    console.warn(`⚠️  [WhatsApp] Cloud API credentials not configured. Skipping ${label}.`, {
      WHATSAPP_PHONE_NUMBER_ID: phoneNumberId ? "set" : "MISSING",
      WHATSAPP_ACCESS_TOKEN: accessToken ? "set" : "MISSING",
      WHATSAPP_BUSINESS_ACCOUNT_ID: businessAccountId ? "set" : "MISSING",
    });
    return { success: false, message: "WhatsApp not configured" };
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
  };

  if (templateName) {
    payload.type = "template";
    payload.template = {
      name: templateName,
      language: { code: "en" },
      components: [{ type: "body", parameters: templateParams }],
    };
  } else {
    payload.type = "text";
    payload.text = { body: text };
  }

  const url = `${apiBase}/${phoneNumberId}/messages`;
  console.log(`📤 [WhatsApp] Sending ${label} via Cloud API...`, {
    url,
    to,
    type: payload.type,
    templateName: templateName || null,
    businessAccountId: businessAccountId || null,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error?.message || "WhatsApp API error");
    err.code = data.error?.code;
    err.meta = data.error?.error_data || null;
    throw err;
  }

  const messageId = data.messages?.[0]?.id || null;
  console.log(`✅ [WhatsApp] ${label} dispatched to ${to}`, {
    messageId,
    response: data.messages?.[0] || data,
  });
  return { success: true, messageId };
};

/**
 * Dispatch an order event message with error handling + logging.
 */
const dispatchOrderMessage = async ({ order, event, text, templateName, templateParams = [], label }) => {
  const { customerName, phone } = orderMeta(order);
  let status = "Sent";
  let errorMsg = null;
  let messageId = null;

  try {
    const result = await sendCloudApiMessage({ to: phone, text, templateName, templateParams, label });
    if (!result.success) {
      status = "Skipped";
      errorMsg = result.message;
    }
    messageId = result.messageId;
  } catch (err) {
    status = "Failed";
    errorMsg = `${err.message}${err.code ? ` (code ${err.code})` : ""}`;
    console.error(`❌ [WhatsApp] ${label} failed for ${phone}:`, {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack,
    });
  }

  await logNotification({
    recipient: phone,
    event,
    orderId: order._id,
    customerName,
    messageText: text,
    status,
    error: status === "Sent" ? null : errorMsg,
  });

  return { success: status === "Sent", status, error: errorMsg, messageId };
};

/**
 * Send WhatsApp notification when an order is placed.
 * @param {Object} order - Order document from MongoDB
 */
const sendOrderPlacedMessage = async (order) => {
  const { customerName, shortId, total, estimated } = orderMeta(order);

  const text =
    `🌊 *AquaPure Order Confirmed* 🌊\n\n` +
    `Hello *${customerName}*,\n\n` +
    `Your order *#${shortId}* has been placed successfully!\n\n` +
    `💰 *Total Amount:* ${total}\n` +
    `🚚 *Estimated Delivery:* ${estimated}\n\n` +
    `Track your order anytime from your AquaPure account.\n` +
    `Thank you for choosing AquaPure! 💧`;

  const templateName = process.env.WHATSAPP_ORDER_PLACED_TEMPLATE;
  const templateParams = templateName
    ? [
        { type: "text", text: customerName },
        { type: "text", text: shortId },
        { type: "text", text: total },
        { type: "text", text: estimated },
      ]
    : [];

  return dispatchOrderMessage({
    order,
    event: "Placed",
    text,
    templateName,
    templateParams,
    label: "Order Placed WhatsApp",
  });
};

/**
 * Send WhatsApp notification when an order goes out for delivery.
 * @param {Object} order - Order document from MongoDB
 */
const sendOutForDeliveryMessage = async (order) => {
  const { customerName, shortId, total } = orderMeta(order);

  const text =
    `🚚 *AquaPure Order Out for Delivery* 🚚\n\n` +
    `Hello *${customerName}*,\n\n` +
    `Great news! Your order *#${shortId}* is now *Out for Delivery* and will reach you soon.\n\n` +
    `💰 *Total Amount:* ${total}\n\n` +
    `Please keep your phone handy. Thank you for choosing AquaPure! 💧`;

  const templateName = process.env.WHATSAPP_OUT_FOR_DELIVERY_TEMPLATE;
  const templateParams = templateName
    ? [
        { type: "text", text: customerName },
        { type: "text", text: shortId },
        { type: "text", text: total },
      ]
    : [];

  return dispatchOrderMessage({
    order,
    event: "Out For Delivery",
    text,
    templateName,
    templateParams,
    label: "Out For Delivery WhatsApp",
  });
};

/**
 * Send WhatsApp notification when an order is completed.
 * @param {Object} order - Order document from MongoDB
 */
const sendOrderCompletedMessage = async (order) => {
  const { customerName, shortId, total } = orderMeta(order);

  const text =
    `✅ *AquaPure Order Completed* ✅\n\n` +
    `Hello *${customerName}*,\n\n` +
    `Your order *#${shortId}* has been *Completed*. Thank you for shopping with AquaPure!\n\n` +
    `💰 *Total Amount:* ${total}\n\n` +
    `We hope you love your order. See you again soon! 💧`;

  const templateName = process.env.WHATSAPP_ORDER_COMPLETED_TEMPLATE;
  const templateParams = templateName
    ? [
        { type: "text", text: customerName },
        { type: "text", text: shortId },
        { type: "text", text: total },
      ]
    : [];

  return dispatchOrderMessage({
    order,
    event: "Completed",
    text,
    templateName,
    templateParams,
    label: "Order Completed WhatsApp",
  });
};

/**
 * Generic WhatsApp dispatcher for admin status updates.
 * Routes "Out For Delivery" and "Completed" to their dedicated builders and
 * falls back to a generic status message for all other statuses (e.g.
 * Confirmed, Processing, Packed, Shipped, Delivered, Cancelled).
 *
 * @param {Object} order         - Order document from MongoDB
 * @param {string} statusEvent   - order status (e.g. "Out For Delivery")
 * @param {string} [customNotes]
 */
const sendOrderStatusWhatsApp = async (order, statusEvent, customNotes = "") => {
  const normalized = String(statusEvent || "").toLowerCase();

  if (normalized.includes("out for delivery")) {
    return sendOutForDeliveryMessage(order, customNotes);
  }
  if (normalized === "completed") {
    return sendOrderCompletedMessage(order, customNotes);
  }

  // Generic status message for every other status.
  const { customerName, shortId, total } = orderMeta(order);
  const statusLabel = statusEvent || "Updated";

  const text =
    `🌊 *AquaPure Order Update* 🌊\n\n` +
    `Hello *${customerName}*,\n\n` +
    `Your order *#${shortId}* is now *${statusLabel}*!\n\n` +
    `💰 *Total Amount:* ${total}\n` +
    (customNotes ? `📌 *Note:* ${customNotes}\n\n` : "\n") +
    `Track your order or get help anytime from your AquaPure account.\n` +
    `Thank you for staying hydrated with AquaPure! 💧`;

  const templateName = process.env.WHATSAPP_STATUS_TEMPLATE;
  const templateParams = templateName
    ? [
        { type: "text", text: customerName },
        { type: "text", text: shortId },
        { type: "text", text: statusLabel },
        { type: "text", text: total },
        { type: "text", text: customNotes || "No additional notes" },
      ]
    : [];

  return dispatchOrderMessage({
    order,
    event: statusLabel,
    text,
    templateName,
    templateParams,
    label: "Order Status WhatsApp",
  });
};

module.exports = {
  sendOrderStatusWhatsApp,
  sendOrderPlacedMessage,
  sendOutForDeliveryMessage,
  sendOrderCompletedMessage,
};
