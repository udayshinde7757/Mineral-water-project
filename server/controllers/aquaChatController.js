// ============================================================================
// AquaChat — controller
// ----------------------------------------------------------------------------
// Validates incoming requests, enforces the rate limit, and sanitizes every
// error before it reaches the client. No secrets ever leave the server.
// ============================================================================

const {
  aquaChat,
  checkRateLimit,
  normalizeMessage,
  getServiceStatus,
} = require("../services/aquaChatService");

// Whitelist of safe page labels the client may report (matches the frontend
// page-label map). Unknown pages are silently ignored.
const ALLOWED_PAGES = new Set([
  "Home",
  "About",
  "Products",
  "Product Details",
  "Gallery",
  "Contact",
  "Enquiry",
  "Login",
  "Signup",
  "Cart",
  "Checkout",
  "Order Success",
  "My Orders",
  "Privacy Policy",
  "Terms of Service",
  "Refund Policy",
]);

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket && req.socket.remoteAddress
    ? req.socket.remoteAddress
    : "unknown";
}

/**
 * @desc    AquaChat — chat with the AI assistant
 * @route   POST /api/aquachat/chat
 * @access  Public
 */
const chat = async (req, res) => {
  const ip = getClientIp(req);

  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      message: "You're sending messages too quickly. Please wait a moment and try again.",
    });
  }

  const { message, history, page } = req.body || {};

  const cleanedMessage = normalizeMessage(message);
  if (!cleanedMessage) {
    return res.status(400).json({
      success: false,
      message: "Please type a message to start the conversation.",
    });
  }

  const pageLabel =
    typeof page === "string" && ALLOWED_PAGES.has(page) ? page : null;

  try {
    const { reply } = await aquaChat(cleanedMessage, history, pageLabel);
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("AquaChat chat error:", error && error.message);
    return res.status(500).json({
      success: false,
      message:
        (error && error.userMessage) ||
        "I'm having trouble connecting right now. Please try again in a moment.",
    });
  }
};

/**
 * @desc    AquaChat — lightweight status (no secrets)
 * @route   GET /api/aquachat
 * @access  Public
 */
const status = (_req, res) => {
  return res.status(200).json({ success: true, ...getServiceStatus() });
};

module.exports = { chat, status };
