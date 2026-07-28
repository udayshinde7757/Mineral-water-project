const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmationEmail } = require("../services/emailService");
const { sendOrderConfirmationSMS } = require("../services/smsService");

// Delivery configuration (must match frontend)
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 50;
const GST_RATE = 0; // Set to 0.18 for 18% GST if needed

/**
 * @desc    Create a new order (COD)
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;

    console.log("📦 Incoming order request body:", JSON.stringify(req.body, null, 2));

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
        product = await Product.findById(item.productId);
      } catch (castErr) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID format: ${item.productId}`,
        });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
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

    // Calculate charges
    const deliveryCharges = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const gst = Math.round(subtotal * GST_RATE);
    const totalAmount = subtotal + deliveryCharges + gst;

    // Create order
    const order = await Order.create({
      user: req.user._id,
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

    // Clear user's cart
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    console.log(`✅ Order #${order._id} created successfully for user ${req.user._id}`);

    // Send email & SMS notifications (non-blocking)
    sendOrderConfirmationEmail(order).catch((err) =>
      console.error("Email notification error:", err.message)
    );
    sendOrderConfirmationSMS(order).catch((err) =>
      console.error("SMS notification error:", err.message)
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
 * @desc    Cancel order (only if not shipped)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = async (req, res) => {
  try {
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

    // Only allow cancellation if not shipped/delivered
    if (!["Placed", "Confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. Current status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = "Cancelled";
    if (order.paymentStatus === "Paid") {
      order.paymentStatus = "Refunded";
    }
    await order.save();

    // Restore stock for each product
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
  }
};

/**
 * @desc    Update order status (for admin use)
 * @route   PUT /api/orders/:id/status
 * @access  Private
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

    const validStatuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;
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
