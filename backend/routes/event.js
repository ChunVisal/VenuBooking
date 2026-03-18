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
  upload.array("images", 10)(req, res, async (err) => {
    if (err) {
      console.error("CLOUDINARY ERROR:", err);
      return res.status(500).json({ error: "Upload failed: " + err.message });
    }

    // 1. Correctly define the variable (singular to match your usage)
    const imageUrl = req.files
      ? req.files.map((file) => file.path || file.secure_url)
      : [];

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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

      const values = [
        title || null,
        description || null,
        // 2. These are already strings from the frontend JSON.stringify
        highlights || "[]",
        date === "" ? null : date,
        venue || null,
        parseFloat(price) || 0,
        category || null,
        // 3. Use the variable we defined above
        JSON.stringify(imageUrl),
        availableSeats === "" ? null : parseInt(availableSeats),
        tags || "[]",
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
// Update events
// -------------------------
// Changed to .array("images") to match your frontend and Create route
router.put("/:id", verifyToken, upload.array("image", 10), async (req, res) => {
  const { id } = req.params;

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
    // 1. Handle Images logic
    let finalImages;
    if (req.files && req.files.length > 0) {
      // If new files uploaded, map them to paths
      finalImages = JSON.stringify(
        req.files.map((file) => file.path || file.secure_url),
      );
    } else {
      // If no new files, keep the existing images from the body
      // We check if it's already a string, otherwise stringify it
      finalImages =
        typeof req.body.images === "string"
          ? req.body.images
          : JSON.stringify(req.body.images || []);
    }

    // 2. FIXED SQL: Added missing comma after $12 and fixed placeholders
    const q = `
      UPDATE events SET 
        title=$1, 
        description=$2, 
        date=$3, 
        venue=$4, 
        price=$5, 
        category=$6, 
        image=$7, 
        available_seats=$8, 
        tags=$9, 
        event_type=$10, 
        location=$11, 
        highlights=$12,
        updated_at=NOW() 
      WHERE id=$13 AND user_id=$14
      RETURNING *
    `;

    // 3. Values array (Must be exactly 14 items)
    const values = [
      title || null, // $1
      description || null, // $2
      date === "" ? null : date, // $3
      venue || null, // $4
      parseFloat(price) || 0, // $5
      category || null, // $6
      finalImages, // $7
      availableSeats === "" ? null : parseInt(availableSeats), // $8
      typeof tags === "string" ? tags : JSON.stringify(tags || []), // $9
      eventType || "offline", // $10
      location || null, // $11
      typeof highlights === "string"
        ? highlights
        : JSON.stringify(highlights || []), // $12
      id, // $13
      req.user.id, // $14
    ];

    const data = await db.query(q, values);

    if (data.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or Event not found" });
    }

    res.status(200).json({ message: "Event updated ✅", event: data.rows[0] });
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ error: "Database error: " + err.message });
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
