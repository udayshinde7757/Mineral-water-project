const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret", {
    expiresIn: "7d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Validation
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: fullname, email, password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please login instead.",
      });
    }

    // Create user
    const user = await User.create({
      fullname: fullname.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate Token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error during registration.",
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate Token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error during login.",
    });
  }
};

/**
 * @desc    Logout user / clear auth
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error during logout.",
    });
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        fullname: req.user.fullname,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error fetching user profile.",
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
};
