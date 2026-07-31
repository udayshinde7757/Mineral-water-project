const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    adminName: {
      type: String,
      required: true,
      default: "Admin",
    },
    adminEmail: {
      type: String,
      required: true,
      default: "admin@aquapure.com",
    },
    action: {
      type: String,
      required: true, // e.g., "Order Status Updated", "Product Created", "Customer Blocked"
    },
    details: {
      type: String,
      required: true,
    },
    targetResource: {
      type: String,
      default: "System",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
