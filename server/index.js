// ⚠️  IMPORTANT: dotenv MUST be the very first thing loaded so that all
// modules and controllers that reference process.env receive the correct values
// during their initial require() call.
const dotenv = require("dotenv");
dotenv.config();

const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const initialProducts = require("./config/seedData");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const addressRoutes = require("./routes/addressRoutes");
const contactRoutes = require("./routes/contactRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");

const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const aquaChatRoutes = require("./routes/aquaChatRoutes");
const seedAdminUser = require("./utils/seedAdmin");
const sendEmailUtils = require("./utils/sendEmail");

const app = express();

// Validate email configuration at startup
const emailValidation = sendEmailUtils.validateEmailConfig ? sendEmailUtils.validateEmailConfig() : null;
if (emailValidation) {
  if (!emailValidation.isValid) {
    console.error("==== EMAIL CONFIGURATION ERROR ====");
    console.error(`   ${emailValidation.message}`);
    console.error(`   Recommendation: ${emailValidation.recommendation}`);
    console.error("=====================================");
  } else if (emailValidation.warning) {
    console.warn("==== EMAIL CONFIGURATION WARNING ====");
    console.warn(`   ${emailValidation.warning}`);
    console.warn(`   Recommendation: ${emailValidation.recommendation}`);
    console.warn("======================================");
  }
}

// Track DB connectivity for /api/health
let dbConnected = false;

// Connect DB & auto-seed products & admin
connectDB()
  .then(async () => {
    dbConnected = true;
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log("No products found in DB. Auto-seeding initial mineral water products...");
        await Product.insertMany(initialProducts);
        console.log("Initial products seeded successfully!");
      }
      await seedAdminUser();
    } catch (err) {
      console.error("Auto-seeding error:", err.message);
    }
  })
  .catch((err) => {
    dbConnected = false;
    console.error("⛔ Server started WITHOUT database connection.");
    console.error("   All API endpoints that require MongoDB will return 503 errors.");
    console.error("   Fix: Add IP 106.216.245.198 to MongoDB Atlas Network Access whitelist.");
    console.error("   Error:", err.message.split("\n")[0]);
  });

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/aquachat", aquaChatRoutes);


app.get("/", (req, res) => {
  res.send("Backend Running — AquaPure API Active");
});

// Health check endpoint — used by testing scripts and monitoring
app.get("/api/health", (req, res) => {
  const sendEmailUtils = require("./utils/sendEmail");
  const emailConfig = sendEmailUtils.getValidatedEmailConfig ? sendEmailUtils.getValidatedEmailConfig() : {};
  const status = {
    server: "UP",
    db: dbConnected ? "CONNECTED" : "DISCONNECTED",
    timestamp: new Date().toISOString(),
    email: {
      provider: emailConfig.provider ? emailConfig.provider.toUpperCase() : "UNKNOWN",
      configured: emailConfig.provider !== "mock",
      from: emailConfig.from || "not set",
    },
    env: {
      MONGO_URI: process.env.MONGO_URI ? "SET" : "MISSING",
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING",
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING",
      RESEND_API_KEY: (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY) ? "SET" : "MISSING",
      SMTP_EMAIL: (process.env.SMTP_EMAIL || process.env.SMTP_USER) ? "SET" : "MISSING",
      SMTP_PASSWORD: (process.env.SMTP_PASSWORD || process.env.SMTP_PASS) ? "SET" : "MISSING",
      CONTACT_EMAIL_ENABLED: process.env.CONTACT_EMAIL_ENABLED || "true",
    },
  };
  return res.status(dbConnected ? 200 : 503).json(status);
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});