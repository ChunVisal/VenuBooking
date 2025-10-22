// routes/event.js
import express from "express";
import db from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET Single Event detail by ID (Public)
router.get("/:id", (_req, res) => {
    const eventId = _req.params.id;
    const q = "SELECT * FROM events WHERE id = ?"; 

    db.query(q, [eventId], (err, data) => {
        if (err) {
            console.error("Error fetching single event:", err);
            return res.status(500).json(err);
        }
        if (data.length === 0) {
            return res.status(404).json("Event not found.");
        }
        return res.status(200).json(data[0]);
    });
});

// Create a new event (protected route)
router.post("/", verifyToken, (_req, res) => {
    let eventDate = _req.body.date;

    if (eventDate && typeof eventDate === 'string') {
        eventDate = eventDate.replace('T', ' ').replace('.000Z', '');
    }

    const q = "INSERT INTO events (`title`, `description`, `date`, `venue`, `price`, `user_id`) VALUES (?, ?, ?, ?, ?, ?)";
 
    // Example values, in a real app these would come from _req.body and _req.user
    const values = [
        _req.body.title,
        _req.body.description,
        eventDate,
        _req.body.venue,
        _req.body.price,
        _req.user.id // Assuming user ID is stored in req.user by verifyToken middleware
    ] 

    db.query(q, values, (err, _data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        return res.status(200).json("Event has been created successfully!");
    })
})

// Get all events Public route
router.get("/", (_req, res) => {
    // FIX: This query selects ALL events from the table.
    const q = "SELECT * FROM events"; 

    db.query(q, (err, data) => {
        if (err) {
             console.error("Error fetching all events:", err);
             return res.status(500).json(err);
        }
        // Returns the array of all events
        return res.status(200).json(data); 
    })
})

// Get all events (protected route)
router.get("/my-listings", verifyToken, (_req, res) => {
    const q = "SELECT * FROM events WHERE user_id = ?";

    db.query(q, [_req.user.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    })
})

// Update an event (protected route)
router.put("/:id", verifyToken, (_req, res) => {
    const q = "UPDATE events SET `title`=?, `description`=?, `date`=?, `venue`=?, `price`=? WHERE `id`=? AND `user_id`=?";

    let eventDate = _req.body.date;
    if (eventDate && typeof eventDate === 'string') {
        eventDate = eventDate.replace('T', ' ').slice(0, 19);
    }

    const values = [
        _req.body.title,
        _req.body.description,
        eventDate,
        _req.body.venue,
        _req.body.price,
        _req.params.id,
        _req.user.id
    ];

    db.query(q, values, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        if (data.affectedRows === 0) {
            // This happens if the event ID is wrong OR if req.user.id does not own the event.
            return res.status(403).json("Error: Event not found or you are not authorized to update this event.");
        }

        return res.status(200).json("Event has been updated successfully!");
    })
});

// Delete an event (protected route)
router.delete("/:id", verifyToken, (_req, res) => {
    const q = "DELETE FROM events WHERE `id`=? AND `user_id`=?";
    
    // Example values, in a real app these would come from req.params and req.user
    const values = [
        _req.params.id,    // <-- The Event ID from the URL parameter
        _req.user.id       // <-- The User ID from the JWT payload (Authorization)
    ];

    db.query(q, values, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        // Check if a row was actually deleted
        if (data.affectedRows === 0) {
            return res.status(403).json("Error: Event not found or you are not authorized to delete this event.");
        }

        return res.status(200).json("Event has been deleted successfully!");
    });
});

export default router;