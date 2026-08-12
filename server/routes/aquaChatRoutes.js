const express = require("express");
const router = express.Router();
const { chat, status } = require("../controllers/aquaChatController");
const { optionalAuth } = require("../middleware/authMiddleware");

// AquaChat — AI customer-support assistant.
// optionalAuth sets req.user when a valid JWT is sent (so the assistant can
// answer order questions with the user's REAL order data), but never blocks
// anonymous visitors from chatting.
router.post("/chat", optionalAuth, chat);

// Lightweight health/status endpoint (returns model + load flags, no secrets)
router.get("/", status);

module.exports = router;
