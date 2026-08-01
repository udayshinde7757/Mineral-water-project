const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const {
  sendAllOrderNotifications,
  sendAllCancellationNotifications,
  sendRefundCompletedNotifications,
} = require("../services/notificationService");
const {
  isRefundable,
  initiateRefund,
  fetchRefundStatus,
  mapRefundStatus,
} = require("../services/refundService");

// Delivery & tax configuration now comes from the SiteSettings collection
// (see services/settingsService.js). Never hardcode these values.
const { getSiteSettings, computeOrderTotals } = require("../services/settingsService");

// Full order lifecycle (must match Order model enum)
const ALL_ORDER_STATUSES = [
  "Placed",
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
];

// Statuses a customer/admin may cancel from (Pending, Confirmed, Processing).
// "Placed" is kept for backward compatibility with orders created earlier.
const CANCELLABLE_STATUSES = ["Placed", "Pending", "Confirmed", "Processing"];

// Maps each status to its dedicated timestamp field (null = none).
const STATUS_TIMESTAMP_MAP = {
  Placed: "orderDate",
  Pending: null,
  Confirmed: "confirmedAt",
  Processing: "processingAt",
  Packed: "packedAt",
  Shipped: "shippedAt",
  "Out For Delivery": "outForDeliveryAt",
  Delivered: "deliveredAt",
  Completed: "completedAt",
  Cancelled: "cancelledAt",
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Normalize an optional cancellation reason string.
 */
const normalizeReason = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 500);
};

/**
 * Record an order status transition: update orderStatus, stamp the matching
 * timestamp field, and append an entry to statusHistory.
 */
const recordStatusChange = (order, status, updatedBy = "system", notes = "") => {
  order.orderStatus = status;

  const tsField = STATUS_TIMESTAMP_MAP[status];
  if (tsField && !order[tsField]) {
    order[tsField] = new Date();
  }

  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy,
    notes,
  });
};

/**
 * Perform the shared cancellation routine: set cancellation fields, process
 * the refund (online only), persist, and restore product stock.
 *
 * @returns {Promise<{order:Object, refund:Object}>}
 */
const performCancellation = async (order, cancelledBy, reason) => {
  order.cancelledBy = cancelledBy;
  if (reason) {
    order.cancellationReason = reason;
  }
  recordStatusChange(order, "Cancelled", cancelledBy, reason ? `Cancelled — ${reason}` : "Order cancelled");

  let refund = { attempted: false };

  if (isRefundable(order)) {
    refund = { attempted: true };
    order.refundAttempts = (order.refundAttempts || 0) + 1;

    try {
      const result = await initiateRefund(order);
      order.paymentStatus = "Refunded";
      order.refundId = result.refundId;
      order.refundAmount = result.amount;
      order.refundedAt = new Date();
      order.refundStatus = mapRefundStatus(result.status);
      order.refundErrorMessage = null;

      refund.success = true;
      refund.refundId = result.refundId;
      refund.refundStatus = order.refundStatus;
      refund.completed = order.refundStatus === "Completed";
    } catch (err) {
      // Refund failed → keep order cancelled, mark refund failed for retry.
      order.refundStatus = "Failed";
      order.refundErrorMessage = err.message;
      refund.success = false;
      refund.error = err.message;
    }
  } else if (order.paymentMethod !== "COD") {
    // Online order with no captured payment to refund (Pending/Failed payment).
    order.refundStatus = "None";
  }

  await order.save();

  // Restore stock for each product
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }

  return { order, refund };
};

/**
 * Fire cancellation + (optional) refund-completed notifications non-blocking.
 */
const fireCancellationNotifications = (order, refund) => {
  sendAllCancellationNotifications(order).catch((err) =>
    console.error("Cancellation notification error:", err.message)
  );
  if (refund && refund.completed) {
    sendRefundCompletedNotifications(order).catch((err) =>
      console.error("Refund-completed notification error:", err.message)
    );
  }
};

/**
 * Shared query builder for admin order listing (search/filter/pagination).
 */
const queryOrders = async ({ search, status, paymentMethod, refundStatus, page = 1, limit = 10 }) => {
  const query = {};

  if (status && status !== "All") query.orderStatus = status;
  if (paymentMethod && paymentMethod !== "All") query.paymentMethod = paymentMethod;
  if (refundStatus && refundStatus !== "All") query.refundStatus = refundStatus;

  if (search && String(search).trim()) {
    const term = String(search).trim();
    const orClauses = [
      { "shippingAddress.fullName": { $regex: term, $options: "i" } },
      { "shippingAddress.email": { $regex: term, $options: "i" } },
      { "shippingAddress.phone": { $regex: term, $options: "i" } },
      { "shippingAddress.city": { $regex: term, $options: "i" } },
      { refundId: { $regex: term, $options: "i" } },
    ];
    if (mongoose.isValidObjectId(term)) {
      orClauses.push({ _id: term });
    }
    query.$or = orClauses;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return { total, page: pageNum, pages: Math.ceil(total / limitNum), orders };
};

// ─── Customer-facing endpoints ────────────────────────────────────────────────

/**
 * @desc    Create a new order (COD)
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, orderType } = req.body;

    console.log("📦 Incoming order request body:", JSON.stringify(req.body, null, 2));
    console.log("📦 Order type:", orderType || "CART");

    // Validate required fields
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products provided for order",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Only allow COD orders via this endpoint (online payments go through /api/payment/verify)
    const allowedCOD = ["COD"];
    if (!allowedCOD.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Use the payment API for online payments",
      });
    }

    // Validate address fields
    const requiredAddressFields = ["fullName", "email", "phone", "addressLine1", "city", "state", "pincode", "country"];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Shipping address field '${field}' is required`,
        });
      }
    }

    // Verify products and calculate amounts server-side (never trust frontend)
    let subtotal = 0;
    const orderProducts = [];
    const missingProductIds = [];

    console.log("🔍 Order Controller — Received product IDs:", products.map(p => p.productId));

    for (const item of products) {
      // Validate productId is a non-empty string
      if (!item.productId || typeof item.productId !== "string" || item.productId.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Each product must have a valid productId string",
        });
      }

      let product;
      try {
        console.log(`  🔎 Product.findById("${item.productId}") ...`);
        product = await Product.findById(item.productId);
        console.log(`  ✅ Found: ${product ? product.name : 'NO'}`);
      } catch (castErr) {
        console.error(`  ❌ Cast error for ID "${item.productId}":`, castErr.message);
        return res.status(400).json({
          success: false,
          message: `Invalid product ID format: ${item.productId}`,
        });
      }

      if (!product) {
        missingProductIds.push(item.productId);
        // Continue checking remaining products to report all missing IDs
        continue;
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      orderProducts.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });

      subtotal += product.price * item.quantity;
    }

    // If any products were not found, report all missing IDs and clean up cart
    if (missingProductIds.length > 0) {
      console.error("❌ Products NOT found in database:", missingProductIds);

      // Clean up invalid product references from user's cart
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { cart: { productId: { $in: missingProductIds } } }
        });
        console.log(`🧹 Removed ${missingProductIds.length} invalid product(s) from user's cart`);
      } catch (cleanupErr) {
        console.error("Cart cleanup error:", cleanupErr.message);
      }

      return res.status(404).json({
        success: false,
        message: `Products not found: ${missingProductIds.join(", ")}. These items were removed from your cart. Please add them again from the products page.`,
      });
    }

    // Calculate charges from current database settings (never trust frontend)
    const { merged: siteSettings } = await getSiteSettings();
    const { deliveryCharges, gst, totalAmount } = computeOrderTotals(subtotal, siteSettings);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderType: orderType === "BUY_NOW" ? "BUY_NOW" : "CART",
      products: orderProducts,
      shippingAddress,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Placed",
      subtotal,
      deliveryCharges,
      gst,
      totalAmount,
    });

    // Reduce stock for each product
    for (const item of orderProducts) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the user's cart ONLY for a CART checkout. A Buy Now order must
    // leave the cart untouched — it was never part of this order.
    if (orderType !== "BUY_NOW") {
      const user = await User.findById(req.user._id);
      user.cart = [];
      await user.save();
    } else {
      console.log("🛒 OrderController: BUY_NOW order → user cart left untouched");
    }

    console.log(`✅ Order #${order._id} created successfully for user ${req.user._id}`);

    // Send notifications (non-blocking) — fires after the order is saved:
    // Owner Email → Customer Email → Customer WhatsApp → Owner WhatsApp → Customer SMS.
    // Notification failures never fail or roll back the order.
    sendAllOrderNotifications(order).catch((err) =>
      console.error("Notification error:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Create Order Error:", error);
    console.error("Stack:", error.stack);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }

    // Handle Mongoose cast errors (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${error.value}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error while creating order",
    });
  }
};

/**
 * @desc    Get all orders for logged-in user
 * @route   GET /api/orders
 * @access  Private
 */
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

/**
 * @desc    Get single order by ID (only if it belongs to user)
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ensure the order belongs to the logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

/**
 * @desc    Cancel order (customer) — only when Pending/Confirmed/Processing
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = async (req, res) => {
  try {
    const reason = normalizeReason(req.body && req.body.cancellationReason);

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ensure the order belongs to the logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Only cancellable from Placed / Confirmed / Processing
    if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. Current status: ${order.orderStatus}`,
      });
    }

    const { order: cancelledOrder, refund } = await performCancellation(order, "customer", reason);

    fireCancellationNotifications(cancelledOrder, refund);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: cancelledOrder,
      refund,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
  }
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/**
 * @desc    Get all orders with search / filter / pagination (Admin)
 * @route   GET /api/orders/admin
 * @access  Private/Admin
 */
exports.getAdminOrders = async (req, res) => {
  try {
    const { search, status, paymentMethod, refundStatus, page, limit } = req.query;
    const result = await queryOrders({ search, status, paymentMethod, refundStatus, page, limit });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Get Admin Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

/**
 * @desc    Get cancelled orders with refund info (Admin)
 * @route   GET /api/orders/admin/cancelled
 * @access  Private/Admin
 */
exports.getAdminCancelledOrders = async (req, res) => {
  try {
    const { search, refundStatus, page, limit } = req.query;
    const result = await queryOrders({ search, status: "Cancelled", refundStatus, page, limit });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Get Cancelled Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cancelled orders",
    });
  }
};

/**
 * @desc    Get single order by ID (Admin)
 * @route   GET /api/orders/admin/:id
 * @access  Private/Admin
 */
exports.getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Admin Order By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

/**
 * @desc    Cancel an order from the admin dashboard
 * @route   PUT /api/orders/admin/:id/cancel
 * @access  Private/Admin
 */
exports.adminCancelOrder = async (req, res) => {
  try {
    const reason = normalizeReason(req.body && req.body.cancellationReason);

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. Current status: ${order.orderStatus}`,
      });
    }

    const { order: cancelledOrder, refund } = await performCancellation(order, "admin", reason);

    fireCancellationNotifications(cancelledOrder, refund);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: cancelledOrder,
      refund,
    });
  } catch (error) {
    console.error("Admin Cancel Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
  }
};

/**
 * @desc    Retry a failed refund for a cancelled order (Admin)
 * @route   POST /api/orders/admin/:id/refund/retry
 * @access  Private/Admin
 */
exports.retryRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Only cancelled orders can be refunded",
      });
    }

    if (order.paymentMethod === "COD") {
      return res.status(400).json({
        success: false,
        message: "Cash on Delivery orders do not require a refund",
      });
    }

    if (order.refundStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Refund has already been completed",
      });
    }

    if (order.refundStatus !== "Failed") {
      return res.status(400).json({
        success: false,
        message: "Only failed refunds can be retried",
      });
    }

    order.refundAttempts = (order.refundAttempts || 0) + 1;

    try {
      const result = await initiateRefund(order);
      order.paymentStatus = "Refunded";
      order.refundId = result.refundId;
      order.refundAmount = result.amount;
      order.refundedAt = new Date();
      order.refundStatus = mapRefundStatus(result.status);
      order.refundErrorMessage = null;
      await order.save();

      if (order.refundStatus === "Completed") {
        sendRefundCompletedNotifications(order).catch((err) =>
          console.error("Refund-completed notification error:", err.message)
        );
      }

      return res.status(200).json({
        success: true,
        message: "Refund retried successfully",
        order,
        refund: { success: true, refundId: result.refundId, refundStatus: order.refundStatus },
      });
    } catch (err) {
      order.refundStatus = "Failed";
      order.refundErrorMessage = err.message;
      await order.save();

      return res.status(502).json({
        success: false,
        message: "Refund attempt failed. Please try again.",
        error: err.message,
        order,
      });
    }
  } catch (error) {
    console.error("Retry Refund Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrying refund",
    });
  }
};

/**
 * @desc    Re-check status of an in-flight refund and complete it if done (Admin)
 * @route   POST /api/orders/admin/:id/refund/check
 * @access  Private/Admin
 */
exports.checkRefundStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.refundStatus !== "Initiated") {
      return res.status(400).json({
        success: false,
        message: "No pending refund to check",
      });
    }

    const status = await fetchRefundStatus(order);

    if (status.status === "processed" || status.status === "succeeded") {
      order.refundStatus = "Completed";
      order.refundedAt = new Date();
      await order.save();

      sendRefundCompletedNotifications(order).catch((err) =>
        console.error("Refund-completed notification error:", err.message)
      );

      return res.status(200).json({
        success: true,
        message: "Refund completed",
        order,
      });
    }

    if (status.status === "failed") {
      order.refundStatus = "Failed";
      order.refundErrorMessage = "Refund was rejected by the payment gateway";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Refund failed at payment gateway. You can retry it.",
        order,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Refund is still pending at the payment gateway",
      gatewayStatus: status.status,
      order,
    });
  } catch (error) {
    console.error("Check Refund Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not check refund status. Please try again later.",
    });
  }
};

/**
 * @desc    Update order status (for admin use)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    if (!ALL_ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${ALL_ORDER_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Cancelling via the status updater still restores stock + processes refunds.
    if (orderStatus === "Cancelled" && order.orderStatus !== "Cancelled") {
      const reason = normalizeReason(req.body && req.body.cancellationReason);
      const { order: cancelledOrder, refund } = await performCancellation(order, "admin", reason);
      fireCancellationNotifications(cancelledOrder, refund);

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order: cancelledOrder,
        refund,
      });
    }

    recordStatusChange(order, orderStatus, "admin");
    if (orderStatus === "Delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};
