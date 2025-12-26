import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/db.js";
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middleware/verifyToken.js";
import eventRoutes from "./routes/event.js";
import wishlistRoutes from "./routes/wishlist.js";
import bookingRoutes from "./routes/booking.js";
import os from "os";

const app = express();

// 🔧 Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🧠 Routes
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/users", (_req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

app.get("/api/users/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: `Access granted, welcome ${req.user.name}!`,
    user_id: req.user.id,
    user_name: req.user.name,
  });
});

// 🚀 Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.clear();
  console.log("✅ VenuBooking Server started");
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💻 Platform: ${os.platform()}`);
  console.log(`🧠 CPU: ${os.cpus()[0].model}`);
  console.log("💾 Database: Connected");
});
