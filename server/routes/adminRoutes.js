const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// Public admin login route
router.post("/login", adminController.adminLogin);

// Protected admin routes (require token & admin role)
router.use(protect);
router.use(admin);

// Profile
router.get("/me", adminController.getAdminProfile);
router.put("/profile", adminController.updateAdminProfile);
router.put("/profile/password", adminController.changeAdminPassword);

// Stats & Analytics
router.get("/stats", adminController.getDashboardStats);
router.get("/analytics", adminController.getAnalytics);

// Orders
router.get("/orders", adminController.getOrders);
router.get("/orders/:id", adminController.getOrderDetails);
router.patch("/orders/:id/status", adminController.updateOrderStatus);
router.post("/orders/:id/complete", adminController.markOrderCompleted);
router.post("/orders/:id/cancel", adminController.cancelOrder);

// Products
router.get("/products", adminController.getProducts);
router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);
router.patch("/products/:id/stock", adminController.updateStock);
router.patch("/products/:id/visibility", adminController.toggleVisibility);

// Inventory
router.get("/inventory", adminController.getInventory);

// Customers & Users
router.get("/customers", adminController.getCustomers);
router.patch("/customers/:id/status", adminController.updateCustomerStatus);
router.delete("/customers/:id", adminController.deleteCustomer);
router.patch("/users/:id/promote", adminController.promoteUserToAdmin);


// Payments & Refunds
router.get("/payments", adminController.getPayments);
router.get("/refunds", adminController.getRefunds);
router.post("/refunds/:id/retry", adminController.retryRefund);

// Notifications & Activity Logs
router.get("/notifications", adminController.getNotifications);
router.post("/notifications/:id/retry", adminController.retryNotification);
router.get("/logs", adminController.getActivityLogs);

// Settings
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

// Reports Export
router.get("/reports/export", adminController.exportData);

module.exports = router;
