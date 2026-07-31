const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "AquaPure Mineral Water Ltd." },
    supportEmail: { type: String, default: "support@aquapure.com" },
    phone: { type: String, default: "+91 98765 43210" },
    gstNumber: { type: String, default: "27AAAAA0000A1Z5" },
    address: { type: String, default: "123 Pure Hydration Park, Industrial Estate, Mumbai, India" },
    logo: { type: String, default: "/images/logo.png" },
    socialLinks: {
      facebook: { type: String, default: "https://facebook.com/aquapure" },
      instagram: { type: String, default: "https://instagram.com/aquapure" },
      twitter: { type: String, default: "https://twitter.com/aquapure" },
    },
    razorpayKeyId: { type: String, default: "rzp_test_sampleKey123" },
    razorpayKeySecret: { type: String, default: "sampleSecretKey456" },
    smtpHost: { type: String, default: "smtp.gmail.com" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
    whatsappPhoneNumberId: { type: String, default: "" },
    whatsappAccessToken: { type: String, default: "" },
    whatsappApiUrl: { type: String, default: "https://graph.facebook.com/v18.0" },
    deliveryCharges: { type: Number, default: 40 },
    taxPercentage: { type: Number, default: 18 },
    minimumOrderValue: { type: Number, default: 100 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
