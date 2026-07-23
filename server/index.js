const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const initialProducts = require("./config/seedData");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");

dotenv.config();

const app = express();

// Connect DB & auto-seed products if collection is empty
connectDB().then(async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("No products found in DB. Auto-seeding initial mineral water products...");
      await Product.insertMany(initialProducts);
      console.log("Initial products seeded successfully!");
    }
  } catch (err) {
    console.error("Auto-seeding error:", err.message);
  }
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

app.get("/", (req, res) => {
  res.send("Backend Running — AquaPure API Active");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
