const Product = require("../models/Product");
const initialProducts = require("../config/seedData");

/**
 * @desc    Get all products with optional filters (category, search, price, sort)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice } = req.query;

    let query = {};

    // Filter by Category
    if (category && category !== "All") {
      query.category = category;
    }

    // Filter by Search Keyword
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { size: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sort === "price_asc") sortOptions = { price: 1 };
    if (sort === "price_desc") sortOptions = { price: -1 };
    if (sort === "featured") sortOptions = { isFeatured: -1, createdAt: -1 };

    const products = await Product.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error fetching products",
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Invalid product ID or server error",
    });
  }
};

/**
 * @desc    Create a new product (Admin)
 * @route   POST /api/products
 * @access  Public (or Admin protected)
 */
const createProduct = async (req, res) => {
  try {
    const { name, size, price, image, category, stock, description, isFeatured } = req.body;

    if (!name || !size || price === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, size, price, image.",
      });
    }

    const product = await Product.create({
      name,
      size,
      price: Number(price),
      image,
      category: category || "Personal",
      stock: stock !== undefined ? Number(stock) : 50,
      description: description || "Premium AquaPure natural mineral water.",
      isFeatured: Boolean(isFeatured),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error creating product",
    });
  }
};

/**
 * @desc    Update product by ID
 * @route   PUT /api/products/:id
 * @access  Public (or Admin protected)
 */
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error updating product",
    });
  }
};

/**
 * @desc    Delete product by ID
 * @route   DELETE /api/products/:id
 * @access  Public (or Admin protected)
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error deleting product",
    });
  }
};

/**
 * @desc    Seed initial products dataset
 * @route   POST /api/products/seed
 * @access  Public
 */
const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(initialProducts);

    return res.status(201).json({
      success: true,
      message: "Product database seeded successfully",
      count: createdProducts.length,
      products: createdProducts,
    });
  } catch (error) {
    console.error("Seed Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error seeding products",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
};
