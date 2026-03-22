// routes/wishlist.js

import express from "express";
import db from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// routes/wishlist.js
router.get("/", verifyToken, (req, res) => {
  // Ensure this string is clean and uses $1
  const q = `
        SELECT e.*, w.id AS wishlist_id, w.created_at AS saved_at
        FROM events e 
        JOIN wishlists w ON e.id = w.event_id 
        WHERE w.user_id = $1
    `; // No extra symbols here!

  db.query(q, [req.user.id], (err, data) => {
    if (err) {
      console.error("SQL Error:", err.message); // Log the real error
      return res.status(500).json(err);
    }
    return res.status(200).json(data.rows);
  });
});

// POST add event to wishlist (CREATE)
router.post("/:eventId", verifyToken, (req, res) => {
  const { eventId } = req.params;

  // REMOVE BACKTICKS: Use standard quotes or none
  const q = "INSERT INTO wishlists (user_id, event_id) VALUES ($1, $2)";

  db.query(q, [req.user.id, eventId], (err, data) => {
    if (err) {
      if (err.code === "23505")
        return res.status(409).json("Already in wishlist");
      return res.status(500).json(err);
    }
    return res.status(201).json("Event added.");
  });
});

// 3. DELETE Remove Event from Wishlist (Delete)
router.delete("/:id", verifyToken, (req, res) => {
  const wishlistId = req.params.id;
  const q = "DELETE FROM wishlists WHERE id = $1 AND user_id = $2";

  db.query(q, [wishlistId, req.user.id], (err, data) => {
    if (err) return res.status(500).json(err);

    // FIX: Use data.rowCount for Postgres
    if (data.rowCount === 0) {
      return res.status(404).send("Wishlist item not found or unauthorized.");
    }
    return res.status(200).send("Event removed from wishlist.");
  });
});

export default router;
