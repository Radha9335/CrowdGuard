const express = require("express");
const { register, login } = require("../controllers/authController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Limit: max 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;