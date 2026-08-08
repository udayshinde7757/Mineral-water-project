const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public read-only endpoints
router.get("/", getProducts);
router.get("/:id", getProductById);

// Everything below mutates the catalog and is ADMIN-ONLY.
// (The admin panel manages products through /api/admin/products; these
//  public routes were previously unprotected, letting anyone create,
//  modify or delete products. The admin middleware below closes that hole.)
router.use(protect, admin);

router.post("/seed", seedProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
