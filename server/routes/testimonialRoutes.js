const express = require("express");
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  seedTestimonials,
} = require("../controllers/testimonialController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public endpoints
router.get("/", getTestimonials);
router.post("/seed", seedTestimonials);

// Admin-only CRUD endpoints
router.post("/", protect, admin, createTestimonial);
router.put("/:id", protect, admin, updateTestimonial);
router.delete("/:id", protect, admin, deleteTestimonial);

module.exports = router;
