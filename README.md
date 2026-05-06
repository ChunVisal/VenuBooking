# VeuBooking

A full-stack event project platform where users can discover, book, and manage event tickets.

**Live Demo:** [https://venubooking.netlify.app](https://venubooking.netlify.app)

---

## ✨ Features

### For Users
- 🔐 Login/Signup with email or Google
- 🎟️ Browse events with infinite scroll
- 📍 Search by location, category, or date
- 💳 Book tickets (Free + Stripe payment)
- 🎫 Receive unique ticket codes
- ❤️ Save events to wishlist
- 🔔 Real-time notifications
- ⭐ Rate events (one rating per user)
- 🌙 Dark mode
- 📱 Fully responsive

### For Event Organizers
- ➕ Create/Display/Edit/Delete events
- 📊 View event analytics (view count)
- 📋 See who booked your events
- 📧 Get notified on new bookings

---

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- React Router
- Axios
- Lucide Icons
- Leaflet Maps
- Stripe Elements

**Backend:**
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- Stripe API
- Cloudinary (image upload)

**Deployment:**
- Frontend: Netlify
- Backend: Render
- Database: Neon Tech

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Stripe account (for payments)

### 📁 Project Structure
venubooking/
├── backend/
│   ├── config/        # DB, Cloudinary config
│   ├── middleware/    # Auth middleware
│   ├── routes/        # API routes
│   └── server.js      # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── context/    # Auth, Wishlist context
│   │   ├── pages/      # All pages
│   │   └── App.jsx
└── README.md

📸 Screenshots
Home	Event Details
https://screenshots/home.png	https://screenshots/event.png
Booking	My Bookings
https://screenshots/booking.png	https://screenshots/tickets.png
🎯 Future Improvements
Email notifications (Nodemailer)

QR code tickets

Admin dashboard

Bakong payment (Cambodia)

Mobile app (React Native)

👨‍💻 Author
Chun Visal

GitHub: @chunvisal



