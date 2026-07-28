const express = require("express");
const router = express.Router();
const {
  submitEnquiry,
  getEnquiries,
  completeEnquiry,
  deleteEnquiry,
  getDashboardStats,
} = require("../controllers/enquiryController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/", submitEnquiry);

// Admin-only routes
router.get("/", protect, admin, getEnquiries);
router.get("/stats", protect, admin, getDashboardStats);
router.put("/:id", protect, admin, completeEnquiry);
router.delete("/:id", protect, admin, deleteEnquiry);

module.exports = router;
