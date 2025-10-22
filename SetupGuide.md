# 📌 Full Stack Setup: React (Vite) + Node.js/Express + MySQL

## 1. Prerequisites

- Install Node.js (v18+ recommended) → [Node.js](https://nodejs.org)
- Install MySQL (Workbench optional)
- Install npm (comes with Node.js)

---

## 2. Setup Database (MySQL)

Open MySQL CLI or Workbench and run:

```sql
CREATE DATABASE eventdb;

USE eventdb;

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE
);

-- Insert sample data
INSERT INTO events (title, description, date) 
VALUES 
('Tech Conference', 'Learn full stack dev', '2025-10-01'),
('Music Concert', 'Live in Phnom Penh', '2025-11-12');
```

---

## 3. Backend Setup (Node.js + Express + MySQL2)

### Initialize Project

```bash
# Go to your project folder
mkdir event-booking-app
cd event-booking-app

# Create backend folder
mkdir backend
cd backend

# Init Node.js
npm init -y

# Install dependencies
npm install express mysql2 dotenv cors nodemon
```

### Create `backend/server.js`

```javascript
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error("DB connection error:", err);
    } else {
        console.log("✅ MySQL connected");
    }
});

// Routes
app.get("/events", (req, res) => {
    db.query("SELECT * FROM events", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
```

### Create `backend/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=eventdb
PORT=5000
```

### Update `package.json` (add scripts)

```json
"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
}
```

### Run Backend

```bash
npm run dev
```

---

## 4. Frontend Setup (React + Vite)

Initialize Project

```bash
# Go back to main project folder
cd ..
mkdir frontend
cd frontend

# Create React app with Vite
npm create vite@latest . 

# Select → React + JavaScript

# Install dependencies
npm install
npm install axios
```

### Create `frontend/src/App.jsx`

```javascript
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/events")
            .then(res => setEvents(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>🎟 Event Booking</h1>
            <ul>
                {events.map(event => (
                    <li key={event.id}>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <small>{event.date}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
```

### Run Frontend

```bash
npm run dev
```

---

## ✅ Final Flow

1. Start MySQL server (ensure `eventdb` exists).
2. Start backend:

     ```bash
     cd backend && npm run dev
     ```

     API available at: [http://localhost:5000](http://localhost:5000)
3. Start frontend:

     ```bash
     cd frontend && npm run dev
     ```

     UI available at: [http://localhost:5173](http://localhost:5173)

### Data Flow

Frontend fetches data from backend → Backend fetches from MySQL → Data displays on UI.
