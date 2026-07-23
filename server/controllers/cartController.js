const User = require("../models/User");
const Product = require("../models/Product");

/**
 * @desc    Add product to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Verify if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user._id);

    // Check if product already exists in cart
    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex > -1) {
      // Increase quantity
      user.cart[cartItemIndex].quantity += 1;
    } else {
      // Add new cart item
      user.cart.push({ productId, quantity: 1 });
    }

    await user.save();

    // Populate product details for the updated cart response
    const updatedUser = await User.findById(req.user._id).populate("cart.productId");

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding product to cart",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.productId");

    res.status(200).json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
      error: error.message,
    });
  }
};

/**
 * @desc    Update cart quantity
 * @route   PUT /api/cart/update
 * @access  Private
 */
exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    // Quantity cannot go below 1
    const targetQuantity = Math.max(1, parseInt(quantity, 10));

    const user = await User.findById(req.user._id);

    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in user's cart",
      });
    }

    cartItem.quantity = targetQuantity;
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("cart.productId");

    res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating cart quantity",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:productId
 * @access  Private
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID parameter is required",
      });
    }

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("cart.productId");

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("Remove from Cart Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while removing item from cart",
      error: error.message,
    });
  }
};
