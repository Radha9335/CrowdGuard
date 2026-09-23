require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const aiRoutes = require("./routes/aiRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

// ── CORS — allow both local and production frontend ──────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://crowd-guard-six.vercel.app",
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes("vercel.app"))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

app.set("io", io);

// ── Middlewares ──────────────────────────────────────────────────
app.use(express.json());

const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express.static(uploadPath));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/incidents", incidentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("CrowdGuard Backend Running 🚀");
});

// ── Error Middleware ─────────────────────────────────────────────
app.use(errorHandler);

// ── Server Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ── Database Connection ──────────────────────────────────────
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
    })
    .catch((err) => {
      console.log("⚠️ MongoDB Connection Error:", err.message);
    });
} else {
  console.log("⚠️ MONGO_URI is missing in environment variables");
}