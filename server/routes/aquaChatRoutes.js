const express = require("express");
const router = express.Router();
const { chat, status } = require("../controllers/aquaChatController");

// AquaChat — AI customer-support assistant
router.post("/chat", chat);

// Lightweight health/status endpoint (returns model + load flags, no secrets)
router.get("/", status);

module.exports = router;
