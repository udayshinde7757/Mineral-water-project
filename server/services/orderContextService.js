// ============================================================================
// AquaChat — live order context service (SERVER-SIDE ONLY)
// ----------------------------------------------------------------------------
// Bridges the Gemini chatbot to the real order data for the CURRENTLY
// AUTHENTICATED user. This service:
//   • Detects when a chat message is about the customer's order(s) — including
//     short follow-ups ("When did I place it?", "Is it paid?") by looking back
//     at the recent conversation.
//   • Fetches ONLY the authenticated user's orders (never any other user's).
//   • Picks the most relevant order (a mentioned ID, else the newest active
//     order) and builds a compact, safe "LIVE ORDER DATA" text block that is
//     injected into the Gemini prompt.
//   • Returns clear notes for the "not logged in" and "no orders" cases so the
//     AI never invents a status.
// Security: the userId always comes from the verified JWT (req.user) — never
// from the client. Only order IDs that belong to that user can ever match.
// ============================================================================

const Order = require("../models/Order");

// How many of the user's recent orders to include in the AI context block.
const MAX_ORDERS_IN_CONTEXT = 5;

// Statuses that are no longer "in progress" — used to prefer an active order
// over an old delivered/completed/cancelled one for single-order questions.
const INACTIVE_STATUSES = new Set(["Delivered", "Completed", "Cancelled"]);

// Strong order-tracking intent on the CURRENT message.
const TRACK_ORDER_RE = new RegExp(
  [
    "\\bmy\\s+(?:\\w+\\s+){0,2}orders?\\b", // my order / my orders / my recent orders
    "\\borders?\\s+(status|id|tracking)\\b", // order status / order id
    "\\borders?\\s+(number|no\\.?)\\b", // order number
    "\\border\\s+#?[A-Za-z0-9]{4,}\\b", // order #ABC123 / order 12345
    "\\b#\\w{4,}\\b", // short order id #ABC123 / #AP12345
    "\\btrack(ing)?\\b", // track / tracking
    "\\bstatus\\b", // status
    "\\bship(ped|ping|ment)?\\b", // shipped / shipping / shipment
    "\\bdeliver(y|ed|ing)?\\b", // delivery / delivered / delivering
    "\\barriv(e|ed|al)?\\b", // arrive / arrived / arrival
    "\\bout\\s+for\\s+delivery\\b",
    "\\bwhen\\s+(did|will|does)\\b", // "when did I place it?" / "when will it arrive?"
    "\\bhas\\s+my\\s+order\\b",
    "\\bcheck(ing)?\\s+(my|the)?\\s*orders?\\b",
    "\\bplace(d)?\\s+it\\b", // "did I place it?"
    "\\bpurchase(d)?\\s+it\\b",
  ].join("|"),
  "i"
);

// Broad order keyword used to recognise a short follow-up by looking back at
// the previous assistant turn (which already talked about the order).
const ORDER_TERM_RE = /\border\b|\btrack\b|\bstatus\b|\bdeliver\b|\bship\b|\barrive\b|#\w{4,}/i;

// Maximum length of a follow-up message that we are willing to interpret by
// referring back to the previous turn (e.g. "When did I place it?").
const MAX_FOLLOW_UP_LENGTH = 80;

// --- Helpers -----------------------------------------------------------------

const fmtCurrency = (value) =>
  Number.isFinite(Number(value))
    ? `₹${Number(value).toLocaleString("en-IN")}`
    : "unknown";

const fmtDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Short display ID used across the app: last 6 chars of the Mongo ObjectId,
// upper-cased (e.g. "#ABC123").
const shortOrderId = (order) => {
  const id = order && order._id ? String(order._id) : "";
  return id ? `#${id.slice(-6).toUpperCase()}` : "unknown";
};

/**
 * Is the current message strongly about the customer's existing order(s)?
 */
function isStrongOrderQuestion(message) {
  return TRACK_ORDER_RE.test(String(message || "").trim());
}

/**
 * Is this a short follow-up that refers back to a previous order discussion?
 * e.g. "When did I place it?" / "Is it paid?" / "How much was it?"
 */
function isOrderFollowUp(message, history) {
  const msg = String(message || "").trim();
  if (!msg || msg.length > MAX_FOLLOW_UP_LENGTH) return false;
  if (!Array.isArray(history) || history.length === 0) return false;

  // Look at the last few turns — the immediately previous assistant reply
  // normally contains the order mention ("Your latest order #ABC123 …").
  const recent = history
    .slice(-3)
    .map((m) => (m && typeof m.content === "string" ? m.content : ""))
    .join(" ");

  return ORDER_TERM_RE.test(recent);
}

/**
 * If the user names a specific order (full ObjectId or the short "#ABC123"
 * form), find it among THIS user's orders only. Returns null when no match
 * or when the order does not belong to the user.
 */
function findMentionedOrder(message, orders) {
  const text = String(message || "");

  // Full 24-char hex ObjectId.
  const oidMatch = text.match(/\b[0-9a-fA-F]{24}\b/);
  if (oidMatch) {
    const found = orders.find(
      (o) => o && o._id && String(o._id) === oidMatch[0]
    );
    if (found) return found;
  }

  // Short form: "#ABC123" or bare "ABC123" (6 alphanumerics).
  const shortMatch = text.match(/\b#?([A-Za-z0-9]{6})\b/);
  if (shortMatch) {
    const code = shortMatch[1].toLowerCase();
    const found = orders.find((o) => {
      const tail = o && o._id ? String(o._id).slice(-6).toLowerCase() : "";
      return tail === code;
    });
    if (found) return found;
  }

  return null;
}

/**
 * Pick the single order to answer single-order questions with:
 *   1. A specifically-mentioned order (must belong to the user).
 *   2. Otherwise the newest ACTIVE order (Placed…Out For Delivery).
 *   3. Otherwise the newest order overall.
 */
function selectRelevantOrder(orders, mentioned) {
  if (mentioned) return mentioned;
  if (!Array.isArray(orders) || orders.length === 0) return null;

  const active = orders.find((o) => !INACTIVE_STATUSES.has(o.orderStatus));
  return active || orders[0];
}

// --- Safe, minimal projection of one order for the AI -------------------------
function formatOrderForContext(order) {
  const items = Array.isArray(order.products)
    ? order.products.map((p) => `${p.name} x${p.quantity}`).join(", ")
    : "";

  const address = order.shippingAddress || {};
  const locationParts = [address.city, address.state].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : null;

  return {
    id: shortOrderId(order),
    orderDate: fmtDate(order.orderDate || order.createdAt),
    orderStatus: order.orderStatus || "unknown",
    paymentStatus: order.paymentStatus || "unknown",
    paymentMethod: order.paymentMethod || "unknown",
    subtotal: fmtCurrency(order.subtotal),
    deliveryCharges: fmtCurrency(order.deliveryCharges),
    total: fmtCurrency(order.totalAmount),
    estimatedDelivery: fmtDate(order.estimatedDelivery),
    items,
    location,
  };
}

// --- Text blocks injected into the system prompt ------------------------------

const NOT_LOGGED_IN_TEXT = [
  "========================================================================",
  "[ORDER STATUS NOTE — NOT LOGGED IN]",
  "The customer asked about their order(s) but is NOT logged in. Politely",
  "explain that they need to log in to their AquaPure account first so you can",
  "securely check their orders. Do NOT show any order data and do NOT invent a",
  "status. You may suggest that after logging in they can ask again.",
  "========================================================================",
].join("\n");

const NO_ORDERS_TEXT = [
  "========================================================================",
  "[ORDER STATUS NOTE — NO ORDERS ON ACCOUNT]",
  "The customer is logged in but currently has NO orders on their account.",
  "If they ask about order status/tracking, respond warmly with something like:",
  "\"I couldn't find any orders on your account yet. Once you place an order,",
  "I'll be able to help you check its status.\"",
  "Do NOT invent an order, an order ID, or a fake status.",
  "========================================================================",
].join("\n");

function buildLiveDataText(formattedOrders, relevant, mentionedId) {
  const lines = [];
  lines.push("========================================================================");
  lines.push("[LIVE ORDER DATA — PROVIDED BY THE SERVER FROM THE AQUAPURE DATABASE]");
  lines.push("This is REAL, current data for the logged-in AquaPure customer. It is the");
  lines.push("single source of truth for this customer's orders. When the customer asks");
  lines.push("about their order status or tracking, answer using ONLY this data. Do NOT");
  lines.push("tell them to check the \"My Orders\" page — you already have the answer.");
  lines.push("All orders listed here belong to this customer.");
  lines.push("");
  lines.push("ORDER ID FORMAT: the app shows short order IDs like \"#ABC123\" (the last 6");
  lines.push("characters of the order's ID). Use this format when referring to an order.");
  lines.push("");

  if (mentionedId) {
    lines.push(`The customer specifically asked about order ${relevant.id} below.`);
  } else {
    lines.push("Relevant order for this conversation (use this one when the customer asks");
    lines.push("about \"my order\" in general):");
  }
  lines.push(`  • Order ${relevant.id} | Status: ${relevant.orderStatus}`);
  lines.push(`    Payment: ${relevant.paymentStatus} (${relevant.paymentMethod})`);
  lines.push(`    Order date: ${relevant.orderDate || "not recorded"}`);
  lines.push(`    Total: ${relevant.total}`);
  if (relevant.deliveryCharges && relevant.deliveryCharges !== "₹0") {
    lines.push(`    Delivery charges: ${relevant.deliveryCharges}`);
  }
  lines.push(
    `    Estimated delivery: ${relevant.estimatedDelivery || "not specified on the order"}`
  );
  if (relevant.items) {
    lines.push(`    Items: ${relevant.items}`);
  }
  if (relevant.location) {
    lines.push(`    Delivering to: ${relevant.location}`);
  }
  lines.push("");

  lines.push("Customer's recent orders (newest first):");
  for (const o of formattedOrders) {
    lines.push(`  • ${o.id} — ${o.orderStatus}${o.orderDate ? ` (${o.orderDate})` : ""}`);
  }
  lines.push("");
  lines.push("If the customer asks about a specific order by ID, answer from that order");
  lines.push("only. Never mention the full internal ObjectId — always use the short form.");
  lines.push("========================================================================");
  return lines.join("\n");
}

// --- Public API --------------------------------------------------------------

/**
 * Decide whether this chat turn should carry live order context, and if so
 * build the text block to inject into the Gemini prompt.
 *
 * @param {Object} options
 * @param {string|null} options.userId  - authenticated user's id (null = anonymous)
 * @param {string}      options.message - current (normalized) user message
 * @param {Array}       options.history - recent conversation (sanitized)
 * @returns {Promise<{kind:string, text:string}|null>}
 *   null            → message is not about the customer's orders
 *   kind "orders"   → LIVE ORDER DATA block
 *   kind "no-orders"→ logged in but no orders
 *   kind "logged-out"→ order question but no authenticated user
 */
async function getOrderContext({ userId, message, history }) {
  const strong = isStrongOrderQuestion(message);
  const followUp = !strong && isOrderFollowUp(message, history);

  // Not an order question at all → no context block.
  if (!strong && !followUp) return null;

  // Order question, but the customer isn't logged in → ask them to log in.
  // Only on a strong question: a short follow-up after a non-order chat must
  // not re-inject the login note (e.g. a product question after an order chat).
  if (!userId) {
    return strong
      ? { kind: "logged-out", text: NOT_LOGGED_IN_TEXT }
      : null;
  }

  // Fetch ONLY this user's orders, newest first.
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(MAX_ORDERS_IN_CONTEXT)
    .lean();

  if (!orders.length) {
    return { kind: "no-orders", text: NO_ORDERS_TEXT };
  }

  // A mentioned ID only counts if it belongs to THIS user (it was selected
  // from this user's own order list above).
  const mentioned = strong ? findMentionedOrder(message, orders) : null;
  const relevant = selectRelevantOrder(orders, mentioned);
  const formatted = orders.map(formatOrderForContext);
  const relevantFormatted =
    relevant && formatted.find((o) => o.id === shortOrderId(relevant)) ||
    formatted[0];

  const text = buildLiveDataText(formatted, relevantFormatted, Boolean(mentioned));

  return { kind: "orders", text };
}

module.exports = {
  getOrderContext,
  // exported for tests / debugging
  isStrongOrderQuestion,
  isOrderFollowUp,
  findMentionedOrder,
  selectRelevantOrder,
  formatOrderForContext,
};
