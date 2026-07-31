const express = require("express");
const router = express.Router();
const { getPublicSettings } = require("../controllers/settingsController");

// Public route: fetch current website settings (delivery, tax, business info).
// Admin updates go through /api/admin/settings (protected by admin middleware).
router.get("/", getPublicSettings);

module.exports = router;
