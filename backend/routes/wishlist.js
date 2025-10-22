
// routes/wishlist.js

import express from "express"
import db from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get user's Wishlist (READ)
router.get("/", verifyToken, (_req, res) => {
    const q = `
        SELECT 
            e.*, 
            w.id AS wishlist_id,
            w.created_at AS saved_at
        FROM events e 
        JOIN wishlists w ON e.id = w.event_id 
        WHERE w.user_id = ?
    `;
    db.query(q, [_req.user.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    })
})

// POST add event to wishlist (CREATE)
router.post("/:eventId", verifyToken, (_req, res) => {
    const { eventId } = _req.params;
    const q = "INSERT INTO wishlists (`user_id`, `event_id`) VALUES (?, ?)";

    db.query(q, [_req.user.id, eventId], (err, data) => {
        if (err) {
            // Error code 1062 is usually a duplicate entry (already saved)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json("Event is already in your wishlist!");
            }
            return res.status(500).json(err);
        }
        return res.status(201).json("Event added to wishlist.");
    });
})

// 3. DELETE Remove Event from Wishlist (Delete)
router.delete("/:id", verifyToken, (_req, res) => {
    // We use 'id' here to capture the wishlist record ID from the URL
    const wishlistId = _req.params.id; 
    
    // FIX: Change the SQL query to delete by the primary key 'id'
    const q = "DELETE FROM wishlists WHERE id = ? AND user_id = ?";

    db.query(q, [wishlistId, _req.user.id], (err, data) => {
        if (err) return res.status(500).json(err);
        
        if (data.affectedRows === 0) {
            // Use .send() for simple string responses
            return res.status(404).send("Wishlist item not found or you are not authorized to remove it.");
        }
        // Use .send() for simple string responses
        return res.status(200).send("Event removed from wishlist.");
    });
});


export default router;