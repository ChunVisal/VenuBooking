import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import db from "../config/db.js"

const router = express.Router();

// 1. POST Create a New Booking (Buy a Ticket)
router.post("/", verifyToken, (_req, res) => {
    // We ONLY need the event_id and the quantity from the body
    const { event_id, quantity } = _req.body; 

    // --- STEP 1: Fetch the current price from the events table ---
    const fetchPriceQuery = "SELECT price FROM events WHERE id = ?";
    
    db.query(fetchPriceQuery, [event_id], (err, eventData) => {
        if (err || eventData.length === 0) {
            return res.status(404).json("Event not found or database error.");
        }
        
        // --- STEP 2: Calculate Total Price on the Backend ---
        const pricePerTicket = parseFloat(eventData[0].price);
        const calculatedTotalPrice = pricePerTicket * quantity; 
        
        // --- STEP 3: Insert the FINAL booking record ---
        const insertQuery = "INSERT INTO bookings (`user_id`, `event_id`, `quantity`, `total_price`) VALUES (?, ?, ?, ?)";
        const values = [_req.user.id, event_id, quantity, calculatedTotalPrice];
        
        db.query(insertQuery, values, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }
            return res.status(201).json({ 
                message: "Booking confirmed! Total charged: $" + calculatedTotalPrice.toFixed(2), 
                booking_id: data.insertId 
            });
        });
    });
});

// 2. GET Booking History (View Your Tickets)
router.get("/listing", verifyToken, (_req, res) => {
    // Joins event details with the user's booking history
    const q = `
        SELECT b.*, e.title, e.date, e.venue
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
    `;

    db.query(q, [_req.user.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
});

// 3. DELETE Cancel a Booking (Protected)
router.delete("/:id", verifyToken, (_req, res) => {
    const bookingId = _req.params.id;

    // CRITICAL: The user can ONLY delete a booking if the ID matches AND the user_id matches
    const q = "DELETE FROM bookings WHERE id = ? AND user_id = ?";
    
    db.query(q, [bookingId, _req.user.id], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        // Check if a row was actually deleted (affectedRows > 0)
        if (data.affectedRows === 0) {
            // This means the booking ID was wrong OR the user tried to delete someone else's booking.
            return res.status(403).json("Booking not found or you are not authorized to cancel it.");
        }

        return res.status(200).json("Booking has been successfully cancelled.");
    });
});

export default router;