const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require user authentication
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartQuantity);
router.delete("/remove/:productId", removeFromCart);

module.exports = router;
