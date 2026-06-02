const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");   // ✅ FIXED
const adminOnly = require("../middleware/adminMiddleware");
const { getDashboardStats } = require("../controllers/adminController");

router.get("/stats", protect, adminOnly, getDashboardStats);

module.exports = router;