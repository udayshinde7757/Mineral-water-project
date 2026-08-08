const mongoose = require("mongoose");
const dns = require("dns");

// Set public DNS servers to bypass corporate DNS blocks
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB: Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB: Connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB: Disconnected");
    });

    // Bypass TLS certificate issues on local Windows dev environment
    if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error(`MongoDB: Initial connection failed: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;