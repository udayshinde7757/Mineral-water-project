const express = require("express");
const router = express.Router();
const {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  seedGallery,
} = require("../controllers/galleryController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public endpoints
router.get("/", getGallery);
router.post("/seed", seedGallery);

// Admin-only CRUD endpoints
router.post("/", protect, admin, createGalleryItem);
router.put("/:id", protect, admin, updateGalleryItem);
router.delete("/:id", protect, admin, deleteGalleryItem);

module.exports = router;
