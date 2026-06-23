const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Protect Middleware
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // ✅ Verify token using SAME secret
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = decoded;

      next();
    } catch (error) {
      console.log("Token Error:", error.message);

      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

// 👑 Admin Only Middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }
};

module.exports = {
  protect,
  adminOnly,
};