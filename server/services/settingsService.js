const SiteSettings = require("../models/SiteSettings");

/**
 * Fallback defaults. These keep the site functional even if no settings
 * document exists yet, and fill in fields missing from older documents.
 */
const DEFAULTS = {
  businessName: "AquaPure Mineral Water Ltd.",
  logo: "/images/logo.png",
  supportEmail: "support@aquapure.com",
  phone: "+91 98765 43210",
  address: "123 Pure Hydration Park, Industrial Estate, Mumbai, India",
  gstNumber: "27AAAAA0000A1Z5",
  socialLinks: {
    facebook: "https://facebook.com/aquapure",
    instagram: "https://instagram.com/aquapure",
    twitter: "https://twitter.com/aquapure",
  },
  // E-commerce configuration (used for all order calculations)
  deliveryCharges: 50,
  freeDeliveryThreshold: 500,
  minimumOrderAmount: 100,
  taxPercentage: 0,
  orderCancellationRules: "",
  paymentMethods: ["COD", "Online"],
  emailNotifications: true,
  whatsappNotifications: true,
};

/**
 * Fields that are safe to expose publicly via GET /api/settings.
 * Anything secret (Razorpay keys, SMTP creds, WhatsApp tokens) is excluded.
 */
const PUBLIC_FIELDS = [
  "businessName",
  "logo",
  "supportEmail",
  "phone",
  "address",
  "gstNumber",
  "socialLinks",
  "deliveryCharges",
  "freeDeliveryThreshold",
  "minimumOrderAmount",
  "taxPercentage",
  "orderCancellationRules",
  "paymentMethods",
  "emailNotifications",
  "whatsappNotifications",
];

/**
 * Fetch the site settings document, creating it with defaults if missing,
 * and merge defaults so older documents missing newer fields still behave.
 *
 * @returns {Promise<{doc: Object, merged: Object, public: Object}>}
 */
async function getSiteSettings() {
  let doc = await SiteSettings.findOne();
  if (!doc) {
    doc = await SiteSettings.create({});
  }
  const merged = { ...DEFAULTS, ...doc.toObject() };
  return {
    doc,
    merged,
    public: pickPublic(merged),
  };
}

/**
 * Reduce settings to only the fields safe for public clients.
 */
function pickPublic(settings) {
  const out = {};
  PUBLIC_FIELDS.forEach((key) => {
    out[key] = settings[key];
  });
  return out;
}

/**
 * Server-authoritative order calculation.
 * Never trust values sent by the frontend — always derive from current settings.
 *
 * @param {number} subtotal - total product value (already validated server-side)
 * @param {Object} settings - merged site settings
 */
function computeOrderTotals(subtotal, settings) {
  const threshold = Number(settings.freeDeliveryThreshold) || 0;
  const deliveryCharge = Number(settings.deliveryCharges) || 0;
  const taxRate = Number(settings.taxPercentage) || 0;

  const deliveryCharges = subtotal >= threshold ? 0 : deliveryCharge;
  const gst = Math.round(subtotal * (taxRate / 100));
  const totalAmount = subtotal + deliveryCharges + gst;

  return { subtotal, deliveryCharges, gst, totalAmount };
}

module.exports = { getSiteSettings, pickPublic, computeOrderTotals, DEFAULTS };
