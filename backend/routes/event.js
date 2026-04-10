import express from "express";
import db from "../config/db.js";
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
    expiresIn: "365d",
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
// GET all events (public)
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
// GET user's own events (logged in user) - SPECIFIC ROUTE FIRST
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
// GET events by user ID (public) - DYNAMIC ROUTE AFTER SPECIFIC
// -------------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT * FROM events 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({ events: result.rows });
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// GET single event with organizer info
// -------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT e.*, 
             u.id as organizer_id,
             u.username as organizer_username,
             u.email as organizer_email,
             u.profile_image as organizer_profile_image,
             u.created_at as organizer_joined
      FROM events e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = result.rows[0];

    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      highlights: event.highlights,
      date: event.date,
      venue: event.venue,
      price: event.price,
      category: event.category,
      image: event.image,
      location: event.location,
      created_at: event.created_at,
      organizer: {
        id: event.organizer_id,
        username: event.organizer_username,
        email: event.organizer_email,
        profile_image: event.organizer_profile_image,
        created_at: event.organizer_joined,
      },
    };

    res.json(formattedEvent);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error fetching event" });
  }
});

// -------------------------
// CREATE new event
// -------------------------
router.post("/", verifyToken, (req, res) => {
  upload.fields([
    { name: "image", maxCount: 10 },
    { name: "images", maxCount: 10 },
  ])(req, res, async (err) => {
    if (err) {
      console.error("CLOUDINARY ERROR:", err);
      return res.status(500).json({ error: "Upload failed: " + err.message });
    }

    const imageUrls = [];

    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        req.files.image.forEach((file) => {
          imageUrls.push(file.path || file.secure_url);
        });
      }
      if (req.files.images && req.files.images.length > 0) {
        req.files.images.forEach((file) => {
          imageUrls.push(file.path || file.secure_url);
        });
      }
    }

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
      // Parse price safely
      let priceValue = 0;
      if (price && price !== "" && price !== "NaN") {
        const parsed = parseFloat(price);
        if (!isNaN(parsed)) {
          priceValue = parsed;
        }
      }

      // Parse availableSeats safely
      let seatsValue = null;
      if (availableSeats && availableSeats !== "" && availableSeats !== "NaN") {
        const parsed = parseInt(availableSeats);
        if (!isNaN(parsed)) {
          seatsValue = parsed;
        }
      }

      const q = `
        INSERT INTO events 
        (title, description, highlights, date, venue, price, category, image, available_seats, tags, event_type, location, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const values = [
        title || null,
        description || null,
        highlights || "[]",
        date === "" ? null : date,
        venue || null,
        priceValue,
        category || null,
        JSON.stringify(imageUrls),
        seatsValue,
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
// UPDATE event
// -------------------------
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "image", maxCount: 10 },
    { name: "images", maxCount: 10 },
  ]),
  async (req, res) => {
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
      existing_images,
    } = req.body;

    try {
      // Handle Images
      let finalImages = [];

      if (existing_images) {
        try {
          const existing = JSON.parse(existing_images);
          finalImages = Array.isArray(existing) ? existing : [existing];
        } catch (e) {
          finalImages = [];
        }
      }

      const newImages = [];
      if (req.files) {
        if (req.files.image && req.files.image.length > 0) {
          req.files.image.forEach((file) => {
            newImages.push(file.path || file.secure_url);
          });
        }
        if (req.files.images && req.files.images.length > 0) {
          req.files.images.forEach((file) => {
            newImages.push(file.path || file.secure_url);
          });
        }
      }

      const allImages = [...finalImages, ...newImages];
      const imageJson = JSON.stringify(allImages);

      // Handle price safely
      let priceValue = null;
      if (
        price !== undefined &&
        price !== null &&
        price !== "" &&
        price !== "NaN"
      ) {
        const parsed = parseFloat(price);
        if (!isNaN(parsed)) {
          priceValue = parsed;
        }
      }

      // Handle seats safely
      let seatsValue = null;
      if (
        availableSeats !== undefined &&
        availableSeats !== null &&
        availableSeats !== "" &&
        availableSeats !== "NaN"
      ) {
        const parsed = parseInt(availableSeats);
        if (!isNaN(parsed)) {
          seatsValue = parsed;
        }
      }

      // Parse tags and highlights
      let tagsJson = "[]";
      if (tags) {
        try {
          tagsJson = typeof tags === "string" ? tags : JSON.stringify(tags);
        } catch (e) {
          tagsJson = "[]";
        }
      }

      let highlightsJson = "[]";
      if (highlights) {
        try {
          highlightsJson =
            typeof highlights === "string"
              ? highlights
              : JSON.stringify(highlights);
        } catch (e) {
          highlightsJson = "[]";
        }
      }

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

      const values = [
        title || null,
        description || null,
        date === "" ? null : date,
        venue || null,
        priceValue,
        category || null,
        imageJson,
        seatsValue,
        tagsJson,
        eventType || "offline",
        location || null,
        highlightsJson,
        id,
        req.user.id,
      ];

      const data = await db.query(q, values);

      if (data.rows.length === 0) {
        return res
          .status(403)
          .json({ error: "Unauthorized or Event not found" });
      }

      res
        .status(200)
        .json({ message: "Event updated ✅", event: data.rows[0] });
    } catch (err) {
      console.error("UPDATE ERROR:", err.message);
      res.status(500).json({ error: "Database error: " + err.message });
    }
  },
);

// -------------------------
// DELETE event
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
// GET reviews for an event
router.get("/:eventId/reviews", async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await pool.query(
      "SELECT reviews FROM events WHERE id = $1",
      [eventId],
    );

    const reviews = result.rows[0]?.reviews || [];
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a review
router.post("/:eventId/reviews", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment, userId, userName, userAvatar } = req.body;

    // Get current event
    const eventResult = await pool.query(
      "SELECT reviews FROM events WHERE id = $1",
      [eventId],
    );

    let reviews = eventResult.rows[0]?.reviews || [];

    // Check if user already reviewed
    const existingReview = reviews.find((r) => r.userId === userId);
    if (existingReview) {
      return res.status(400).json({ error: "You already reviewed this event" });
    }

    // Add new review
    const newReview = {
      id: Date.now(),
      userId,
      userName,
      userAvatar,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);

    // Calculate new average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    // Update event
    await pool.query(
      "UPDATE events SET reviews = $1, rating = $2 WHERE id = $3",
      [JSON.stringify(reviews), avgRating, eventId],
    );

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a review
router.delete("/:eventId/reviews/:reviewId", async (req, res) => {
  try {
    const { eventId, reviewId } = req.params;

    // Get current event
    const eventResult = await pool.query(
      "SELECT reviews FROM events WHERE id = $1",
      [eventId],
    );

    let reviews = eventResult.rows[0]?.reviews || [];

    // Remove review
    reviews = reviews.filter((r) => r.id !== parseInt(reviewId));

    // Recalculate average
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Update event
    await pool.query(
      "UPDATE events SET reviews = $1, rating = $2 WHERE id = $3",
      [JSON.stringify(reviews), avgRating, eventId],
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
