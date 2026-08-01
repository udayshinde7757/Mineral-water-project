const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
    },
    // Which checkout flow created this order. BUY_NOW orders must NOT clear the
    // user's cart; CART orders clear it (see orderController / paymentController).
    orderType: {
      type: String,
      enum: ["CART", "BUY_NOW"],
      default: "CART",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "UPI", "Card", "NetBanking", "Razorpay / Online", "Stripe"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["Placed", "Pending", "Confirmed", "Processing", "Packed", "Shipped", "Out For Delivery", "Delivered", "Completed", "Cancelled"],
      default: "Placed",
    },
    confirmedAt: { type: Date, default: null },
    processingAt: { type: Date, default: null },
    packedAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String, default: "system" },
        notes: { type: String, default: "" },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    gst: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    estimatedDelivery: {
      type: Date,
    },

    // ── Cancellation tracking ──────────────────────────────────────────────
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "admin"],
      default: null,
    },

    // ── Refund tracking (online payments only) ─────────────────────────────
    refundId: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundStatus: {
      type: String,
      enum: ["None", "Initiated", "Completed", "Failed"],
      default: "None",
    },
    refundAttempts: {
      type: Number,
      default: 0,
    },
    refundErrorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-set estimated delivery to 3-5 days from order date
orderSchema.pre("save", async function () {
  if (!this.estimatedDelivery) {
    const deliveryDate = new Date(this.orderDate || Date.now());
    deliveryDate.setDate(deliveryDate.getDate() + 4); // 4 days estimated
    this.estimatedDelivery = deliveryDate;
  }

  // Seed the initial status history entry when an order is first created.
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [
      {
        status: this.orderStatus,
        timestamp: this.orderDate || new Date(),
        updatedBy: "system",
        notes: "Order placed",
      },
    ];
  }
});

module.exports = mongoose.model("Order", orderSchema);
