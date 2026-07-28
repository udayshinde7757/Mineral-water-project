const express = require("express");
const router = express.Router();
const { getSavedAddress, saveAddress } = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");

// All address routes require authentication
router.use(protect);

router.get("/", getSavedAddress);
router.put("/", saveAddress);

module.exports = router;
