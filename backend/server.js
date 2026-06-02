const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const http = require("http");

const { Server } = require("socket.io");

const incidentRoutes = require("./routes/incidentRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");   // ✅ ADD THIS
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
   origin: "http://localhost:5174",
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






// 🔹 Middlewares
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// 🔹 Routes
app.use("/api/incidents", incidentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);   // ✅ ADD THIS

app.get("/", (req, res) => {
  res.send("CrowdGuard Backend Running 🚀");
});

// 🔹 Error Middleware (ALWAYS AFTER ROUTES)
app.use(errorHandler);

// 🔹 Database Connection + Server Start

mongoose.connect(
  "mongodb+srv://del27015radha_db_user:CrowdGuard123@cluster0.yxq8gf9.mongodb.net/crowdguard?retryWrites=true&w=majority&appName=Cluster0"
)



  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

console.log("MY SERVER FILE IS LOADED");

    server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
  })
  .catch((err) => console.log(err));