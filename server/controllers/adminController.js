const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");
const SiteSettings = require("../models/SiteSettings");
const NotificationLog = require("../models/NotificationLog");
const { getSiteSettings } = require("../services/settingsService");
const { sendOrderStatusEmail } = require("../services/emailService");
const { sendOrderStatusWhatsApp } = require("../services/whatsappService");

// Helper to log admin actions
async function logAdminActivity(req, action, details, targetResource = "System") {
  try {
    await ActivityLog.create({
      adminId: req.user ? req.user._id : null,
      adminName: req.user ? req.user.fullname : "Admin",
      adminEmail: req.user ? req.user.email : "admin@aquapure.com",
      action,
      details,
      targetResource,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
    });
  } catch (err) {
    console.error("Error logging admin activity:", err.message);
  }
}

// Helper to initialize Razorpay client
async function getRazorpayClient() {
  const settings = await SiteSettings.findOne();
  const key_id = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
  const key_secret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "dummy_secret";
  return new Razorpay({ key_id, key_secret });
}

// ─── ADMIN AUTHENTICATION ───────────────────────────────────────────────────

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    const isAdmin = user.role === "admin" || adminEmails.includes(user.email.toLowerCase());

    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. Not an admin account." });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ success: false, message: "Your admin account is currently blocked." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "7d" }
    );

    req.user = user;
    await logAdminActivity(req, "Admin Login", `Admin ${user.email} logged in successfully`, "Auth");

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Admin Login Error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { fullname, phone, avatar, twoFactorEnabled } = req.body;
    const admin = await User.findById(req.user._id);

    if (fullname) admin.fullname = fullname;
    if (phone) admin.phone = phone;
    if (avatar) admin.avatar = avatar;
    if (typeof twoFactorEnabled === "boolean") admin.twoFactorEnabled = twoFactorEnabled;

    await admin.save();
    await logAdminActivity(req, "Profile Updated", "Admin profile details updated", "Profile");

    return res.status(200).json({ success: true, message: "Profile updated successfully", admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user._id).select("+password");

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    admin.password = newPassword;
    await admin.save();

    await logAdminActivity(req, "Password Changed", "Admin account password changed", "Security");
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DASHBOARD STATS & ANALYTICS ──────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      packedOrders,
      shippedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      completedOrders,
      cancelledOrders,
      refundedOrders,
      totalCustomers,
      totalProducts,
      outOfStockProducts,
      todayOrders,
      weekOrders,
      totalRevenueResult,
      monthRevenueResult,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ["Pending", "Placed"] } }),
      Order.countDocuments({ orderStatus: "Processing" }),
      Order.countDocuments({ orderStatus: "Packed" }),
      Order.countDocuments({ orderStatus: "Shipped" }),
      Order.countDocuments({ orderStatus: "Out For Delivery" }),
      Order.countDocuments({ orderStatus: "Delivered" }),
      Order.countDocuments({ orderStatus: "Completed" }),
      Order.countDocuments({ orderStatus: "Cancelled" }),
      Order.countDocuments({ refundStatus: "Completed" }),
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Order.countDocuments({ orderDate: { $gte: startOfToday } }),
      Order.countDocuments({ orderDate: { $gte: startOfWeek } }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { orderDate: { $gte: startOfMonth }, orderStatus: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const thisMonthRevenue = monthRevenueResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        packedOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        completedOrders,
        cancelledOrders,
        refundedOrders,
        totalCustomers,
        totalProducts,
        outOfStockProducts,
        todayOrders,
        weekOrders,
        thisMonthRevenue,
      },
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = d.toLocaleString("default", { month: "short" });
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      last6Months.push({ monthLabel, startDate, endDate });
    }

    const monthlySalesData = await Promise.all(
      last6Months.map(async (m) => {
        const result = await Order.aggregate([
          { $match: { orderDate: { $gte: m.startDate, $lte: m.endDate }, orderStatus: { $ne: "Cancelled" } } },
          { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        ]);
        return {
          month: m.monthLabel,
          revenue: result[0]?.revenue || 0,
          orders: result[0]?.count || 0,
        };
      })
    );

    // Status breakdown
    const statusDistribution = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    // Payment methods breakdown
    const paymentMethods = await Order.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.name",
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    // Cancellation & Refund Rate
    const totalOrders = await Order.countDocuments();
    const cancelledCount = await Order.countDocuments({ orderStatus: "Cancelled" });
    const refundedCount = await Order.countDocuments({ refundStatus: "Completed" });
    const cancellationRate = totalOrders > 0 ? ((cancelledCount / totalOrders) * 100).toFixed(1) : 0;
    const refundRate = totalOrders > 0 ? ((refundedCount / totalOrders) * 100).toFixed(1) : 0;

    // Average Order Value
    const totalRevAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const totalRev = totalRevAgg[0]?.total || 0;
    const validOrdersCount = totalRevAgg[0]?.count || 0;
    const averageOrderValue = validOrdersCount > 0 ? (totalRev / validOrdersCount).toFixed(2) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        monthlySales: monthlySalesData,
        statusDistribution,
        paymentMethods,
        topProducts,
        cancellationRate,
        refundRate,
        averageOrderValue,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ORDER MANAGEMENT ───────────────────────────────────────────────────────

exports.getOrders = async (req, res) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 10, sortBy = "latest" } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== "All") {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { "shippingAddress.fullName": searchRegex },
        { "shippingAddress.phone": searchRegex },
        { "shippingAddress.email": searchRegex },
      ];
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === "oldest") sortOption = { createdAt: 1 };
    if (sortBy === "highest") sortOption = { totalAmount: -1 };
    if (sortBy === "lowest") sortOption = { totalAmount: 1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort(sortOption).skip(skip).limit(limitNum).populate("user", "fullname email phone"),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "fullname email phone createdAt");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = status;
    const now = new Date();

    if (status === "Confirmed") order.confirmedAt = now;
    if (status === "Processing") order.processingAt = now;
    if (status === "Packed") order.packedAt = now;
    if (status === "Shipped") order.shippedAt = now;
    if (status === "Out For Delivery") order.outForDeliveryAt = now;
    if (status === "Delivered") order.deliveredAt = now;
    if (status === "Completed") {
      order.completedAt = now;
      if (order.paymentMethod === "COD") order.paymentStatus = "Paid";
    }

    order.statusHistory.push({
      status,
      timestamp: now,
      updatedBy: req.user ? req.user.fullname : "Admin",
      notes: notes || `Status updated to ${status}`,
    });

    await order.save();

    // Trigger Email & WhatsApp dispatches
    await sendOrderStatusEmail(order, status, notes);
    await sendOrderStatusWhatsApp(order, status, notes);

    await logAdminActivity(req, "Order Status Updated", `Order #${order._id} status changed to ${status}`, "Orders");

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.markOrderCompleted = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.orderStatus = "Completed";
    order.completedAt = new Date();
    if (order.paymentMethod === "COD") order.paymentStatus = "Paid";

    order.statusHistory.push({
      status: "Completed",
      timestamp: new Date(),
      updatedBy: req.user ? req.user.fullname : "Admin",
      notes: "Marked as completed by admin",
    });

    await order.save();

    await sendOrderStatusEmail(order, "Completed", "Thank you for shopping with AquaPure!");
    await sendOrderStatusWhatsApp(order, "Completed", "Thank you for shopping with AquaPure!");

    await logAdminActivity(req, "Order Completed", `Order #${order._id} marked as completed`, "Orders");

    return res.status(200).json({ success: true, message: "Order marked as completed", order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = "admin";
    order.cancellationReason = cancellationReason || "Cancelled by administrator";

    // Auto process Razorpay refund if paid online
    if (order.paymentStatus === "Paid" && order.razorpayPaymentId) {
      try {
        const razorpay = await getRazorpayClient();
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.totalAmount * 100),
          notes: { reason: order.cancellationReason },
        });

        order.refundId = refund.id;
        order.refundAmount = order.totalAmount;
        order.refundedAt = new Date();
        order.refundStatus = "Completed";
        order.paymentStatus = "Refunded";
      } catch (refundErr) {
        console.error("Razorpay refund error:", refundErr.message);
        order.refundStatus = "Failed";
        order.refundErrorMessage = refundErr.message;
      }
    }

    order.statusHistory.push({
      status: "Cancelled",
      timestamp: new Date(),
      updatedBy: req.user ? req.user.fullname : "Admin",
      notes: `Order cancelled. Reason: ${order.cancellationReason}`,
    });

    // Restore stock
    for (const item of order.products) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
    }

    await order.save();

    await sendOrderStatusEmail(order, "Cancelled", order.cancellationReason);
    await sendOrderStatusWhatsApp(order, "Cancelled", order.cancellationReason);

    await logAdminActivity(req, "Order Cancelled", `Order #${order._id} cancelled by admin. Reason: ${order.cancellationReason}`, "Orders");

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PRODUCT MANAGEMENT ─────────────────────────────────────────────────────

exports.getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category && category !== "All") query.category = category;
    if (search) {
      query.name = new RegExp(search.trim(), "i");
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name, size, price, image, images, category, stock, description,
      rating, isFeatured, originalPrice, discountPercent, isOffer, offerText, isVisible
    } = req.body;

    const product = new Product({
      name,
      size,
      price: Number(price),
      image,
      images: Array.isArray(images) ? images : [image],
      category,
      stock: Number(stock),
      description,
      rating: rating ? Number(rating) : 4.8,
      isFeatured: Boolean(isFeatured),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discountPercent: discountPercent ? Number(discountPercent) : 0,
      isOffer: Boolean(isOffer),
      offerText: offerText || "",
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
    });

    await product.save();
    await logAdminActivity(req, "Product Created", `Created product "${product.name}"`, "Products");

    return res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await logAdminActivity(req, "Product Updated", `Updated product "${product.name}"`, "Products");
    return res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await logAdminActivity(req, "Product Deleted", `Deleted product "${product.name}"`, "Products");
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.stock = Number(stock);
    await product.save();

    await logAdminActivity(req, "Stock Updated", `Stock updated for "${product.name}" to ${stock}`, "Inventory");
    return res.status(200).json({ success: true, message: "Stock updated successfully", product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isVisible = !product.isVisible;
    await product.save();

    await logAdminActivity(req, "Product Visibility Toggled", `Product "${product.name}" visibility set to ${product.isVisible}`, "Products");
    return res.status(200).json({ success: true, message: "Visibility updated", product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── INVENTORY MANAGEMENT ───────────────────────────────────────────────────

exports.getInventory = async (req, res) => {
  try {
    const [allProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
      Product.find().sort({ stock: 1 }),
      Product.find({ stock: { $gt: 0, $lte: 10 } }),
      Product.find({ stock: 0 }),
    ]);

    return res.status(200).json({
      success: true,
      inventory: {
        totalProducts: allProducts.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        products: allProducts,
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CUSTOMER MANAGEMENT ────────────────────────────────────────────────────

exports.getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { role: "user" };

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ fullname: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    // Attach order count & total spending
    const customersWithMetrics = await Promise.all(
      users.map(async (u) => {
        const ordersAgg = await Order.aggregate([
          { $match: { user: u._id, orderStatus: { $ne: "Cancelled" } } },
          { $group: { _id: null, totalSpent: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        ]);
        return {
          ...u.toObject(),
          totalOrders: ordersAgg[0]?.count || 0,
          lifetimeSpending: ordersAgg[0]?.totalSpent || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      customers: customersWithMetrics,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body; // "active" or "blocked"
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.status = status;
    await customer.save();

    await logAdminActivity(req, "Customer Status Changed", `Customer ${customer.email} account set to ${status}`, "Customers");
    return res.status(200).json({ success: true, message: `Customer account ${status}`, customer });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await logAdminActivity(req, "Customer Deleted", `Deleted customer account ${customer.email}`, "Customers");
    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PAYMENTS & REFUNDS ─────────────────────────────────────────────────────

exports.getPayments = async (req, res) => {
  try {
    const payments = await Order.find()
      .select("_id totalAmount paymentMethod paymentStatus razorpayPaymentId razorpayOrderId createdAt shippingAddress")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRefunds = async (req, res) => {
  try {
    const refunds = await Order.find({ refundStatus: { $ne: "None" } })
      .select("_id totalAmount refundId refundAmount refundStatus refundedAt refundErrorMessage razorpayPaymentId cancellationReason shippingAddress")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, refunds });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.retryRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: "No Razorpay payment ID associated with this order" });
    }

    const razorpay = await getRazorpayClient();
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(order.totalAmount * 100),
      notes: { reason: "Admin retry refund" },
    });

    order.refundId = refund.id;
    order.refundAmount = order.totalAmount;
    order.refundedAt = new Date();
    order.refundStatus = "Completed";
    order.paymentStatus = "Refunded";
    order.refundErrorMessage = null;
    await order.save();

    await logAdminActivity(req, "Refund Retried", `Retried refund for Order #${order._id} successfully`, "Refunds");

    return res.status(200).json({ success: true, message: "Refund processed successfully", order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── NOTIFICATION LOGS ──────────────────────────────────────────────────────

exports.getNotifications = async (req, res) => {
  try {
    const logs = await NotificationLog.find().sort({ sentAt: -1 }).limit(100);
    return res.status(200).json({ success: true, notifications: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.retryNotification = async (req, res) => {
  try {
    const log = await NotificationLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: "Notification log not found" });
    }

    const order = log.orderId ? await Order.findById(log.orderId) : null;
    if (!order) {
      return res.status(400).json({ success: false, message: "Associated order not found for retry" });
    }

    if (log.type === "Email") {
      await sendOrderStatusEmail(order, log.event, "Retried dispatch by admin");
    } else {
      await sendOrderStatusWhatsApp(order, log.event, "Retried dispatch by admin");
    }

    log.retryCount = (log.retryCount || 0) + 1;
    await log.save();

    await logAdminActivity(req, "Notification Retried", `Retried sending ${log.type} to ${log.recipient}`, "Notifications");

    return res.status(200).json({ success: true, message: "Notification retry triggered" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ACTIVITY LOGS ──────────────────────────────────────────────────────────

exports.getActivityLogs = async (req, res) => {
  try {
    const { search, module, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter by module (targetResource) e.g. Orders, Products, Settings
    if (module && module !== "All") {
      query.targetResource = module;
    }

    // Filter by action date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Free-text search across admin, action and details
    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { adminName: searchRegex },
        { adminEmail: searchRegex },
        { action: searchRegex },
        { details: searchRegex },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      ActivityLog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SITE SETTINGS ──────────────────────────────────────────────────────────

exports.getSettings = async (req, res) => {
  try {
    const { merged } = await getSiteSettings();
    return res.status(200).json({ success: true, settings: merged });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    await logAdminActivity(req, "Settings Updated", "Admin updated site system settings", "Settings");

    const { merged } = await getSiteSettings();
    return res.status(200).json({ success: true, message: "Settings updated successfully", settings: merged });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── EXPORT REPORTS ─────────────────────────────────────────────────────────

exports.exportData = async (req, res) => {
  try {
    const { type } = req.query; // "orders", "customers", "products", "inventory", "revenue"

    if (type === "orders") {
      const orders = await Order.find().sort({ createdAt: -1 });
      const csvRows = [
        ["Order ID", "Customer", "Phone", "Total Amount", "Status", "Payment Method", "Date"].join(","),
        ...orders.map((o) =>
          [
            o._id,
            `"${o.shippingAddress?.fullName || ""}"`,
            `"${o.shippingAddress?.phone || ""}"`,
            o.totalAmount,
            o.orderStatus,
            o.paymentMethod,
            new Date(o.createdAt).toISOString().split("T")[0],
          ].join(",")
        ),
      ];
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=orders_report.csv");
      return res.status(200).send(csvRows.join("\n"));
    }

    if (type === "products") {
      const products = await Product.find().sort({ name: 1 });
      const csvRows = [
        ["Product ID", "Name", "Category", "Price", "Stock", "Rating", "Featured"].join(","),
        ...products.map((p) =>
          [`"${p._id}"`, `"${p.name}"`, p.category, p.price, p.stock, p.rating, p.isFeatured].join(",")
        ),
      ];
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=products_report.csv");
      return res.status(200).send(csvRows.join("\n"));
    }

    if (type === "customers") {
      const customers = await User.find({ role: "user" }).select("-password");
      const csvRows = [
        ["Customer ID", "Name", "Email", "Phone", "Status", "Joined Date"].join(","),
        ...customers.map((c) =>
          [`"${c._id}"`, `"${c.fullname}"`, `"${c.email}"`, `"${c.phone || ""}"`, c.status, new Date(c.createdAt).toISOString().split("T")[0]].join(",")
        ),
      ];
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=customers_report.csv");
      return res.status(200).send(csvRows.join("\n"));
    }

    return res.status(400).json({ success: false, message: "Invalid report type specified" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN PROMOTION ────────────────────────────────────────────────────────

exports.promoteUserToAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent users from promoting/modifying themselves
    if (req.user && req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot modify or promote your own account role.",
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found.",
      });
    }

    if (targetUser.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "User is already an administrator.",
      });
    }

    targetUser.role = "admin";
    await targetUser.save();

    // Log action to ActivityLog
    await logAdminActivity(
      req,
      "User Promoted to Admin",
      `Promoted user ${targetUser.email} (${targetUser.fullname}) to admin role`,
      "User Management"
    );

    return res.status(200).json({
      success: true,
      message: `User ${targetUser.fullname} (${targetUser.email}) successfully promoted to Admin.`,
      user: {
        id: targetUser._id,
        fullname: targetUser.fullname,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
      },
    });
  } catch (err) {
    console.error("Promote User Error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error promoting user.",
    });
  }
};

