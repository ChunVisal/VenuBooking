import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/db.js";
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middleware/verifyToken.js";
import eventRoutes from "./routes/event.js";
import wishlistRoutes from "./routes/wishlist.js";
import bookingRoutes from "./routes/booking.js";
import chalk from "chalk";
import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import cliProgress from "cli-progress";
import os from "os";

const app = express();

// 🔧 Middleware setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// 🧠 Routes
app.get("/", (_req, res) => res.send("Server is running!"));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bookings", bookingRoutes);
app.get("/users", (_req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});
app.get("/api/users/profile", verifyToken, (_req, res) => {
  return res.status(200).json({
    message: `Access granted, Welcome ${_req.user.name}!`,
    user_id: _req.user.id,
    user_name: _req.user.name,
    secret_info: "Your event data can be fetched here."
  });
});

// 🚀 Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.clear();

  // 🔥 Animated text
  const title = chalkAnimation.rainbow(
    figlet.textSync("VenuBooking", { horizontalLayout: "default" })
  );

  setTimeout(() => {
    title.stop();
    console.log(chalk.cyanBright("✨ Venue Booking Server is starting..."));

    // 📊 Loading Bar
    const bar = new cliProgress.SingleBar({
      format: chalk.greenBright("🟢 Loading: [{bar}] {percentage}% | ETA: {eta}s"),
      barCompleteChar: "#",
      barIncompleteChar: "-",
    }, cliProgress.Presets.shades_classic);

    bar.start(100, 0);
    let value = 0;
    const timer = setInterval(() => {
      value += 20;
      bar.update(value);
      if (value >= 100) {
        clearInterval(timer);
        bar.stop();
        console.log(chalk.green("\n✅ Server successfully started!"));
        console.log(chalk.yellow(`🌐 Running on: http://localhost:${PORT}`));
        console.log(chalk.blue(`💻 Platform: ${os.platform()} | 🧠 CPU: ${os.cpus()[0].model}`));
        console.log(chalk.magenta(`🕒 Uptime: ${Math.floor(os.uptime() / 60)} minutes`));
        console.log(chalk.cyanBright("💾 Database: Connected\n"));
      }
    }, 200);
  }, 2000);
});
