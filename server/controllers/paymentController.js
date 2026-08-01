const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendAllOrderNotifications } = require("../services/notificationService");
const { getSiteSettings, computeOrderTotals } = require("../services/settingsService");

/**
 * Initialize Razorpay instance
 */
const getRazorpayInstance = () => {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
  });
};

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products provided",
      });
    }

    // Verify products and calculate amount server-side
    let subtotal = 0;
    const missingProductIds = [];

    console.log("🔍 Payment Controller — Received product IDs:", products.map(p => p.productId));

    for (const item of products) {
      console.log(`  🔎 Product.findById("${item.productId}") ...`);
      const product = await Product.findById(item.productId);
      console.log(`  ✅ Found: ${product ? product.name : 'NO'}`);

      if (!product) {
        missingProductIds.push(item.productId);
        continue;
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      subtotal += product.price * item.quantity;
    }

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
        message: `Products not found: ${missingProductIds.join(", ")}. These items were removed from your cart.`,
      });
    }

    // Calculate charges from current database settings (never trust frontend)
    const { merged: siteSettings } = await getSiteSettings();
    const { deliveryCharges, gst, totalAmount } = computeOrderTotals(subtotal, siteSettings);

    // Create Razorpay order (amount in paise)
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
      },
    });

    return res.status(200).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature and create order
 * @route   POST /api/payment/verify
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      products,
      shippingAddress,
      paymentMethod,
      orderType,
    } = req.body;

    console.log("💳 Payment verification request:", JSON.stringify({ razorpay_order_id, razorpay_payment_id, productCount: products?.length }, null, 2));

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products provided",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
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

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Recalculate amounts server-side
    let subtotal = 0;
    const orderProducts = [];
    const missingProductIds = [];

    console.log("🔍 Verify Payment — Received product IDs:", products.map(p => p.productId));

    for (const item of products) {
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
        return res.status(400).json({
          success: false,
          message: `Invalid product ID format: ${item.productId}`,
        });
      }

      if (!product) {
        missingProductIds.push(item.productId);
        continue;
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

    if (missingProductIds.length > 0) {
      console.error("❌ Products NOT found in database:", missingProductIds);

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
        message: `Products not found: ${missingProductIds.join(", ")}. These items were removed from your cart.`,
      });
    }

    // Calculate charges from current database settings (never trust frontend)
    const { merged: siteSettings } = await getSiteSettings();
    const { deliveryCharges, gst, totalAmount } = computeOrderTotals(subtotal, siteSettings);

    // Create order with payment details
    const order = await Order.create({
      user: req.user._id,
      orderType: orderType === "BUY_NOW" ? "BUY_NOW" : "CART",
      products: orderProducts,
      shippingAddress,
      paymentMethod: paymentMethod || "Razorpay / Online",
      paymentStatus: "Paid",
      orderStatus: "Placed",
      subtotal,
      deliveryCharges,
      gst,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    console.log(`✅ Online Order #${order._id} created successfully for user ${req.user._id}`);

    // Reduce stock
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
      console.log("🛒 PaymentController: BUY_NOW order → user cart left untouched");
    }

    // Send notifications (non-blocking) — fires after the order is saved:
    // Owner Email → Customer Email → Customer WhatsApp → Owner WhatsApp → Customer SMS.
    // Notification failures never fail or roll back the order.
    sendAllOrderNotifications(order).catch((err) =>
      console.error("Notification error:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Verify Payment Error:", error);
    console.error("Stack:", error.stack);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${error.value}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};
