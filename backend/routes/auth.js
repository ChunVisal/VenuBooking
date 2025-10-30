// backend/routes/auth.js
import express from "express";
import db from "../config/db.js"
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"; 
import { verifyToken } from "../middleware/verifyToken.js"; 
import { sendVerificationEmail } from "../utils/mailer.js"; 
import crypto from "crypto";
import { OAuth2Client } from 'google-auth-library';

// CLIENT ID setup
const CLIENT_ID = "1659854909-eleor0ckd60rshs6f17uv0542bi24brp.apps.googleusercontent.com"; 
const googleClient = new OAuth2Client(CLIENT_ID);
const router = express.Router();

// Issue JWT and set cookie
const issueJwtAndRespond = (res, id, email) => {
  const token = jwt.sign({ id, email }, "your-secret-key", { expiresIn: "1h" });
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: false, // for localhost
    sameSite: "Lax",
    maxAge: 3600000,
  });
  return res;
};

// Google login / register
router.post("/google/callback", async (req, res) => {
  const googleToken = req.body.credential;
  if (!googleToken) return res.status(400).json({ error: "Google token missing." });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();
    const q = "SELECT * FROM users WHERE email = ?";

    db.query(q, [email], (err, data) => {
      if (err) return res.status(500).json({ error: "Database error." });

      if (data.length === 0) {
        const dummyPassword = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10);
        const insertQ = "INSERT INTO users (`name`, `email`, `password`, `is_verified`) VALUES (?, ?, ?, 1)";
        db.query(insertQ, [name, email, dummyPassword], (insertErr, insertData) => {
          if (insertErr) return res.status(500).json({ error: "Registration failed." });
          issueJwtAndRespond(res, insertData.insertId, email)
            .status(200)
            .json({ success: true, message: "New user registered and logged in." });
        });
      } else {
        issueJwtAndRespond(res, data[0].id, email)
          .status(200)
          .json({ success: true, message: "User logged in successfully." });
      }
    });
  } catch (error) {
    console.error("Google verification failed:", error);
    res.status(401).json({ error: "Token verification failed." });
  }
});

// =============================================================
// YOUR EXISTING STANDARD ROUTES
// =============================================================

// Endpoint: POST /api/auth/register
router.post("/register", async (req, res) => {
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [req.body.email], async (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("User already exists!");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const insertQuery = "INSERT INTO users (`name`,`email`,`password`, `verification_token`, `is_verified`) VALUES (?)";
        const values = [req.body.name, req.body.email, hash, verificationToken, 0];

        db.query(insertQuery, [values], (err) => {
            if (err) return res.status(500).json(err);
            
            sendVerificationEmail(req.body.email, verificationToken);

            return res.status(200).json("User created. Check your email for verification link.");
        });
    });
});

// Endpoint: GET /api/auth/verify
router.get("/verify", (req, res) => {
    const { token } = req.query;
    
    const q = "UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?";
    db.query(q, [token], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows === 0) return res.status(400).json("Invalid or expired verification token.");

        res.redirect("http://localhost:5173/login?verification=success");
    });
});

// Endpoint: POST /api/auth/login
router.post("/login", (req, res) => {
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [req.body.email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found!");

        const user = data[0];

        if (user.is_verified !== 1) {
            return res.status(403).json("Account not verified. Please check your email.");
        }

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswordCorrect) return res.status(400).json("Wrong username or password!");

        issueJwtAndRespond(res, user.id, user.email)
            .status(200)
            .json({ id: user.id, name: user.name, email: user.email, message: "Login successful" });
    });
});

// Endpoint: PUT /api/auth/update
router.put("/update", verifyToken, (req, res) => {
    const userId = req.user.id;
    const { name, email, password } = req.body;
    
    if (!name && !email && !password) {
        return res.status(200).json("No changes provided.");
    }

    let updateFields = [];
    let updateValues = [];

    if (name) {
        updateFields.push("name = ?");
        updateValues.push(name);
    }
    if (email) {
        updateFields.push("email = ?");
        updateValues.push(email);
    }
    if (password) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        updateFields.push("password = ?");
        updateValues.push(hash);
    }

    const q = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(userId);

    db.query(q, updateValues, (err, data) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json("Failed to update user.");
        }
        if (data.affectedRows === 0) {
            return res.status(404).json("User not found.");
        }
        return res.status(200).json("User updated successfully.");
    });
});


// Endpoint: POST /api/auth/logout
router.post("/logout", (_req, res) => {
    return res
    .clearCookie("access_token", {
        httpOnly: true,
    })
    .status(200)
    .json("User has been logged out.");
})

// Endpoint: DELETE /api/auth/delete
router.delete("/delete", verifyToken, (_req, res) => {
    const userId = _req.user.id; 

    const q = "DELETE FROM users WHERE id = ?";

    db.query(q, [userId], (err, data) => {
        if (err) {
            console.error("User deletion error:", err);
            return res.status(500).json(err);
        }
        if (data.affectedRows === 0) {
            return res.status(404).json("User account not found.");
        }
        
        return res
            .clearCookie("access_token", {
                httpOnly: true,
            })
            .status(200)
            .json("User account deleted.");
    });
});

export default router;