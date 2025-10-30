// routes/event.js
import express from "express";
import db from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// New route for Google Sign-In
router.post("/google", async (req, res) => {
    const { googleToken } = req.body;

    if (!googleToken) {
        return res.status(400).json("Google token missing.");
    }

    try {
        // 1. Verify the ID Token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;
        
        // **IMPORTANT:** Google already verified this email!

        // 2. Check if the user exists in your database
        const q = "SELECT * FROM users WHERE email = ?";
        db.query(q, [email], async (err, data) => {
            if (err) return res.status(500).json("DB Error during Google sign-in check.");

            let userId;
            
            if (data.length === 0) {
                // 3a. User is NEW: Register them automatically
                const InsertQuery = "INSERT INTO users (`name`, `email`, `is_verified`) VALUES (?, ?, 1)";
                // We don't need a password since they signed in with Google
                
                db.query(InsertQuery, [name, email], (insertErr, insertData) => {
                    if (insertErr) {
                        console.error("DB Error on Google user insert:", insertErr);
                        return res.status(500).json("Database error: Failed to register user.");
                    }
                    userId = insertData.insertId;
                    
                    // Proceed to issue JWT and login
                    issueJwtAndRespond(res, userId, email);
                });
            } else {
                // 3b. User EXISTS: Log them in
                userId = data[0].id;
                issueJwtAndRespond(res, userId, email);
            }
        });

    } catch (error) {
        console.error("Google Token Verification Failed:", error);
        return res.status(401).json("Invalid or expired Google token.");
    }
});


// Helper function to issue JWT (same as your current login flow)
const issueJwtAndRespond = (res, id, email) => {
    const token = jwt.sign({ id, email }, "your-secret-key", { expiresIn: '1h' }); 
    
    // Use the same cookie logic as your regular /login route
    return res
        .cookie("access_token", token, {
            httpOnly: true,
            maxAge: 3600000 
        })
        .status(200)
        .json({ id, email, message: "Google Sign-In successful" });
};

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