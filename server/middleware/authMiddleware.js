const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_jwt_secret"
      );

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User account no longer exists. Unauthorized.",
        });
      }

      if (req.user.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Your account has been suspended by an administrator.",
        });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no authentication token provided.",
    });
  }
};

/**
 * Optional authentication — sets req.user when a valid Bearer token is present,
 * otherwise leaves req.user as null and CONTINUES (never fails the request).
 *
 * Used by public-but-personalizable endpoints (e.g. AquaChat) that must still
 * work for logged-out visitors, but want the authenticated user's context when
 * a token is supplied. The user is always resolved from the JWT server-side —
 * never from the request body — so one user can never act as another.
 */
const optionalAuth = async (req, _res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_jwt_secret"
      );

      const user = await User.findById(decoded.id).select("-password");

      // Only an existing, active user gets context. Invalid/expired/blocked
      // tokens simply fall back to "anonymous" — the chat still works.
      req.user = user && user.status === "active" ? user : null;
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

const admin = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdminRole = req.user && req.user.role === "admin";
  const isEmailAdmin = req.user && adminEmails.includes(req.user.email.toLowerCase());

  if (!req.user || (!isAdminRole && !isEmailAdmin)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

module.exports = { protect, admin, optionalAuth };

