import { Router, raw } from "express";
const router = Router();
import pool from "../config/db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import crypto from "crypto";
const { randomBytes } = crypto;
import Stripe from "stripe";

console.log("Stripe Secret Key exists:", !!process.env.STRIPE_SECRET_KEY);
console.log(
  "Stripe Secret Key starts with sk_:",
  process.env.STRIPE_SECRET_KEY?.startsWith("sk_"),
);
console.log(
  "Stripe Secret Key first 10 chars:",
  process.env.STRIPE_SECRET_KEY?.substring(0, 10),
);

// Test Stripe connection
router.get("/test-stripe", async (req, res) => {
  try {
    // Just try to create a tiny payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: "usd",
    });
    res.json({ 
      success: true, 
      message: "Stripe is working!",
      clientSecret: paymentIntent.client_secret 
    });
  } catch (err) {
    console.error("Stripe test error:", err);
    res.status(500).json({ 
      error: err.message,
      type: err.type,
      key_prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7)
    });
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const generateBookingCode = () => {
  return "BK" + randomBytes(4).toString("hex").toUpperCase();
};

const generateTicketCode = () => {
  return "TCK" + randomBytes(4).toString("hex").toUpperCase();
};

// Check availability
router.get("/check-availability/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventQuery = `SELECT id, title, available_seats, price, date FROM events WHERE id = $1`;
    const eventResult = await pool.query(eventQuery, [eventId]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];
    const bookedQuery = `
      SELECT COALESCE(SUM(ticket_count), 0) as total_booked
      FROM bookings 
      WHERE event_id = $1 AND status != 'cancelled'
    `;
    const bookedResult = await pool.query(bookedQuery, [eventId]);
    const totalBooked = parseInt(bookedResult.rows[0].total_booked);
    const availableSeats =
      event.available_seats === null ? null : parseInt(event.available_seats);
    const remainingSeats = availableSeats ? availableSeats - totalBooked : null;

    res.json({
      event_id: event.id,
      title: event.title,
      total_capacity: availableSeats,
      booked_tickets: totalBooked,
      remaining_seats: remainingSeats,
      is_available: availableSeats === null ? true : remainingSeats > 0,
      price: parseFloat(event.price),
    });
  } catch (err) {
    console.error("Availability check error:", err);
    res.status(500).json({ error: "Failed to check availability" });
  }
});

// Create booking for free events
router.post("/create-free", verifyToken, async (req, res) => {
  const { event_id, ticket_count } = req.body;
  const user_id = req.user.id;

  try {
    // Check if already booked
    const existingBooking = await pool.query(
      "SELECT id FROM bookings WHERE event_id = $1 AND user_id = $2 AND status != 'cancelled'",
      [event_id, user_id],
    );

    if (existingBooking.rows.length > 0) {
      return res.status(409).json({
        error: "You have already booked this event",
      });
    }

    // Get event details
    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];

    // Generate booking code
    const bookingCode = "BK" + randomBytes(4).toString("hex").toUpperCase();

    // Create booking
    const bookingResult = await pool.query(
      `
      INSERT INTO bookings (booking_code, event_id, user_id, ticket_count, total_price, payment_status)
      VALUES ($1, $2, $3, $4, $5, 'free')
      RETURNING *
    `,
      [bookingCode, event_id, user_id, ticket_count, 0],
    );

    const booking = bookingResult.rows[0];

    // Create tickets
    for (let i = 0; i < ticket_count; i++) {
      const ticketCode = "TCK" + randomBytes(4).toString("hex").toUpperCase();
      await pool.query(
        `
        INSERT INTO tickets (ticket_code, booking_id, event_id, user_id, ticket_type)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [ticketCode, booking.id, event_id, user_id, "regular"],
      );
    }

    res.json({
      success: true,
      booking: {
        ...booking,
        event_title: event.title,
        event_date: event.date,
      },
    });
  } catch (err) {
    console.error("Free booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create booking after successful payment
router.post("/create", verifyToken, async (req, res) => {
  const {
    event_id,
    ticket_count,
    payment_intent_id,
    ticket_type = "regular",
  } = req.body;
  const user_id = req.user.id;

  console.log("Creating booking after payment:", {
    event_id,
    ticket_count,
    payment_intent_id,
  });

  try {
    // Verify payment intent
    const paymentIntent =
      await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Check if already booked
    const existingBooking = await pool.query(
      "SELECT id FROM bookings WHERE event_id = $1 AND user_id = $2 AND status != 'cancelled'",
      [event_id, user_id],
    );

    if (existingBooking.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "You have already booked this event" });
    }

    // Get event details
    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];
    let unitPrice = parseFloat(event.price);
    if (ticket_type === "vip") unitPrice = unitPrice * 2;
    if (ticket_type === "early_bird") unitPrice = unitPrice * 0.8;

    const totalPrice = unitPrice * ticket_count;

    // Generate booking code
    const bookingCode = "BK" + randomBytes(4).toString("hex").toUpperCase();

    // Create booking
    const bookingResult = await pool.query(
      `
      INSERT INTO bookings (booking_code, event_id, user_id, ticket_count, total_price, payment_status, payment_method,  purchase_date)
      VALUES ($1, $2, $3, $4, $5, 'paid', 'stripe', NOW())
      RETURNING *
    `,
      [bookingCode, event_id, user_id, ticket_count, totalPrice],
    );

    const booking = bookingResult.rows[0];

    // Create tickets
    for (let i = 0; i < ticket_count; i++) {
      const ticketCode = "TCK" + randomBytes(4).toString("hex").toUpperCase();
      await pool.query(
        `
        INSERT INTO tickets (ticket_code, booking_id, event_id, user_id, ticket_type)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [ticketCode, booking.id, event_id, user_id, ticket_type],
      );
    }

    res.json({
      success: true,
      booking: {
        ...booking,
        event_title: event.title,
        event_date: event.date,
      },
    });
  } catch (err) {
    console.error("Paid booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create Stripe Payment Intent
router.post("/create-payment-intent", verifyToken, async (req, res) => {
  const { event_id, ticket_count, ticket_type = "regular" } = req.body;

  try {
    // Get event details
    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];
    let unitPrice = parseFloat(event.price);

    // Apply ticket type pricing (if needed)
    if (ticket_type === "vip") unitPrice = unitPrice * 2;
    if (ticket_type === "early_bird") unitPrice = unitPrice * 0.8;

    const totalAmount = Math.round(unitPrice * ticket_count * 100); // Convert to cents

    console.log("Total amount in cents:", totalAmount);

    // Create Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "usd",
      metadata: {
        event_id: event_id,
        user_id: req.user.id,
        ticket_count: ticket_count,
        ticket_type: ticket_type,
      },
    });

    console.log("Payment intent created:", paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount / 100,
      currency: "usd",
    });
  } catch (err) {
    console.error("Payment intent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// CONFIRM PAYMENT
router.put("/confirm-payment/:bookingId", verifyToken, async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET payment_status = 'paid', payment_method = 'stripe', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [bookingId, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error("Confirm payment error:", err);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// GET USER'S BOOKINGS
router.get("/my-bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await pool.query(
      `SELECT b.*, e.title as event_title, e.date as event_date, e.venue as event_venue, e.image as event_image
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC`,
      [req.user.id],
    );

    if (!bookings.rows || bookings.rows.length === 0) {
      return res.json([]);
    }

    const bookingsWithTickets = await Promise.all(
      bookings.rows.map(async (booking) => {
        const tickets = await pool.query(
          "SELECT * FROM tickets WHERE booking_id = $1",
          [booking.id],
        );
        return { ...booking, tickets: tickets.rows || [] };
      }),
    );

    res.json(bookingsWithTickets);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Failed to get bookings" });
  }
});

export default router;
