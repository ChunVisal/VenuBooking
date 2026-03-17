import express from "express";
import db from "../config/db.js"; // your pg Pool
import { verifyToken } from "../middleware/verifyToken.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// -------------------------
// Google Sign-In
// -------------------------
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const googleClient = new OAuth2Client(CLIENT_ID);

const issueJwtAndRespond = (res, id, email, name) => {
  const token = jwt.sign({ id, email, name }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.status(200).json({
    success: true,
    message: "Google Sign-In successful",
    token,
    user: { id, email, name },
  });
};

router.post("/google", async (req, res) => {
  const { googleToken } = req.body;
  if (!googleToken)
    return res.status(400).json({ error: "Google token missing" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    const q = "SELECT * FROM users WHERE email = $1";
    const userData = await db.query(q, [email]);

    if (userData.rows.length === 0) {
      // Create new user
      const insertQ = `
        INSERT INTO users (name, email, is_verified) 
        VALUES ($1, $2, true) 
        RETURNING id, email, name
      `;
      const insertData = await db.query(insertQ, [name, email]);
      return issueJwtAndRespond(res, insertData.rows[0].id, email, name);
    } else {
      return issueJwtAndRespond(
        res,
        userData.rows[0].id,
        email,
        userData.rows[0].name,
      );
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid or expired Google token" });
  }
});

// -------------------------
// Get all events (public)
// -------------------------
router.get("/", async (_req, res) => {
  try {
    const data = await db.query("SELECT * FROM events ORDER BY date ASC");
    return res.status(200).json(data.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
});

// -------------------------
// Get single event by ID (public)
// -------------------------
router.get("/:id", async (_req, res) => {
  const eventId = _req.params.id;
  try {
    const data = await db.query("SELECT * FROM events WHERE id=$1", [eventId]);
    if (data.rows.length === 0)
      return res.status(404).json({ error: "Event not found" });
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
});

// -------------------------
// Get events for logged-in user
// -------------------------
router.get("/user/events", verifyToken, async (req, res) => {
  try {
    const data = await db.query(
      "SELECT * FROM events WHERE user_id=$1 ORDER BY date ASC",
      [req.user.id],
    );
    return res.status(200).json(data.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch user events" });
  }
});

// -------------------------
// Create new event
// -------------------------
router.post("/", verifyToken, (req, res) => {
  // Use upload manually to catch the exact error
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("CLOUDINARY ERROR:", err);
      return res
        .status(500)
        .json({ error: "Cloudinary upload failed: " + err.message });
    }

    // If no file was uploaded, req.file will be undefined
    const imageUrl = req.file ? req.file.path || req.file.secure_url : null;
    console.log("FINAL CHECK - Saving this string to DB:", imageUrl);
    const {
      title,
      description,
      date,
      venue,
      price,
      category,
      availableSeats,
      tags,
      eventType,
      location,
      highlights,
    } = req.body;

    try {
      const q = `
    INSERT INTO events 
    (title, description, highlights, date, venue, price, category, image, available_seats, tags, event_type, location, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

      const values = [
        title || null,
        description || null,
        // FIX: If date is empty string, send null so Postgres doesn't crash
        date === "" ? null : date,
        venue || null,
        parseFloat(price) || 0,
        category || null,
        imageUrl,
        highlights,
        availableSeats === "" ? null : parseInt(availableSeats),
        tags, // Already stringified from frontend
        eventType || "offline",
        location || null,
        req.user.id,
      ];

      const data = await db.query(q, values);
      res
        .status(201)
        .json({ message: "Event created ✅", event: data.rows[0] });
    } catch (err) {
      console.error("DATABASE ERROR:", err.message);
      res.status(500).json({ error: "Database error: " + err.message });
    }
  });
});

// -------------------------
// Update event
// -------------------------
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  const { id } = req.params;

  // MATCH THESE NAMES TO YOUR FRONTEND STATE
  const {
    title,
    description,
    date,
    venue,
    price,
    category,
    available_seats, // matches frontend
    tags,
    event_type, // matches frontend
    location,
    rating,
    highlights,
  } = req.body;

  try {
    // 1. Check if we have a new image from Cloudinary, otherwise keep old one
    let imageUrl = req.body.image; // default to existing image string
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url;
    }

    const q = `
      UPDATE events SET 
        title=$1, description=$2, date=$3, venue=$4, price=$5, category=$6, 
        image=$7, available_seats=$8, tags=$9, event_type=$10, location=$11, rating=$12, highlights=$13
        updated_at=NOW()
      WHERE id=$14 AND user_id=$15
      RETURNING *
    `;

    const values = [
      title || null,
      description || null,
      date === "" ? null : date,
      venue || null,
      parseFloat(price) || 0,
      category || null,
      imageUrl || null,
      available_seats === "" ? null : parseInt(available_seats),
      tags
        ? typeof tags === "string"
          ? tags
          : JSON.stringify(tags)
        : JSON.stringify([]),
      event_type || "offline",
      location || null,
      rating || null,
      highlights || null,
      id,
      req.user.id,
    ];

    const data = await db.query(q, values);

    if (data.rows.length === 0) {
      return res.status(403).json({ error: "Event not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ message: "Event updated ✅", event: data.rows[0] });
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    return res.status(500).json({ error: "Database error: " + err.message });
  }
});

// -------------------------
// Delete event
// -------------------------
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "DELETE FROM events WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, req.user.id],
    );

    if (data.rows.length === 0)
      return res.status(403).json({ error: "Event not found or unauthorized" });

    return res
      .status(200)
      .json({ message: "Event deleted ✅", event: data.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
