const User = require("../models/User");

/**
 * @desc    Get user's saved shipping address
 * @route   GET /api/address
 * @access  Private
 */
exports.getSavedAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      address: user.shippingAddress || null,
    });
  } catch (error) {
    console.error("Get Saved Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching address",
    });
  }
};

/**
 * @desc    Save / update user's shipping address
 * @route   PUT /api/address
 * @access  Private
 */
exports.saveAddress = async (req, res) => {
  try {
    const { fullName, email, phone, addressLine1, addressLine2, city, state, pincode, country } = req.body;

    // Validate required fields
    const requiredFields = { fullName, email, phone, addressLine1, city, state, pincode, country };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Field '${key}' is required`,
        });
      }
    }

    const user = await User.findById(req.user._id);
    user.shippingAddress = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || "").trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: country.trim(),
    };

    // Also update phone on user if not set
    if (!user.phone) {
      user.phone = phone.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address saved successfully",
      address: user.shippingAddress,
    });
  } catch (error) {
    console.error("Save Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving address",
    });
  }
};
