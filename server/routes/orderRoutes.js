const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAdminOrders,
  getAdminCancelledOrders,
  getAdminOrderById,
  adminCancelOrder,
  retryRefund,
  checkRefundStatus,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(protect);

// Customer endpoints
router.post("/", createOrder);
router.get("/", getUserOrders);
router.put("/:id/cancel", cancelOrder);

// Admin endpoints — registered BEFORE /:id so "admin" isn't matched as an id.
router.get("/admin", admin, getAdminOrders);
router.get("/admin/cancelled", admin, getAdminCancelledOrders);
router.get("/admin/:id", admin, getAdminOrderById);
router.put("/admin/:id/cancel", admin, adminCancelOrder);
router.post("/admin/:id/refund/retry", admin, retryRefund);
router.post("/admin/:id/refund/check", admin, checkRefundStatus);
router.put("/:id/status", admin, updateOrderStatus);

// Customer single-order lookup (kept last)
router.get("/:id", getOrderById);

module.exports = router;
