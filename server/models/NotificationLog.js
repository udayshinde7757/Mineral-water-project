const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Email", "WhatsApp"],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true, // e.g., "Order Confirmed", "Out For Delivery", "Delivered", "Completed", "Cancelled", "Refunded"
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    customerName: {
      type: String,
      default: "",
    },
    messageSnippet: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Sent", "Failed", "Pending", "Skipped"],
      default: "Sent",
    },
    error: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
