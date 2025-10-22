// routes/auth.js
import express from "express";
import db from "../config/db.js"
import bcrypt from "bcryptjs"; // for hashing passwords
import jwt from "jsonwebtoken"; // for generating JWT tokens
import { verifyToken } from "../middleware/verifyToken.js"; 
import { sendVerificationEmail } from "../utils/mailer.js";
import crypto from "crypto";

const router = express.Router();

// Register new user
router.post("/register", (_req, res) => {
    const { name, email, password} = _req.body;

    // 1. Check if user already exists
    const q = "SELECT * FROM users WHERE email = ? OR name = ?";

    db.query(q, [email, name], async (err, data) => {// NOTE: Changed to async to use await with email sender
        if (err) {
            console.error("DB Error on register check:", err);
            return res.status(500).json(err);
        }
        if (data.length) return res.status(409).json("User already exists with this email!");

        // 2. Hash Password and Generate Verification Token
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        
        // Generate a simple, secure 32-character hex token for the verification link
        const verificationToken = crypto.randomBytes(16).toString('hex'); 

        // 3. Insert new user into DB with token and unverified status (is_verified = 0)
        const InsertQuery = "INSERT INTO users (`name`, `email`, `password`, `verification_token`) VALUES (?, ?, ?, ?)";
        const values = [name, email, hashedPassword, verificationToken];

        db.query(InsertQuery, values, async (err, _data) => {
            if (err) {
                console.error("DB Error on user insert:", err);
                return res.status(500).json("Database error: Failed to create user.");
            }
            
            // 4. Send Verification Email
            try {
                await sendVerificationEmail(email, verificationToken);
                return res.status(201).json("User created. Please check your email to verify your account!");
            } catch (emailError) {
                console.error("Email send failed, but user created:", emailError.message);
                // Return a 201 success but warn the user that verification email failed (for robustness)
                return res.status(201).json("User created. WARNING: Verification email failed to send. Try logging in later.");
            }
        });
    });
});
// Login user
router.post("/login", (_req, res) => {
    const { email, password } = _req.body;

    // Check if user exists
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found!");

        const user = data[0];

        // 2. Check Verification Status (NEW STEP!)
        if (user.is_verified === 0) {
            return res.status(403).json("Account not verified. Please check your email.");
        }

        // Compare provided password with hashed password in DB
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) return res.status(400).json("Wrong password!");
        
        // Generate JWT token (optional, not implemented here)
        const token = jwt.sign({ id: user.id, email: user.email}, "your-secret-key");
        // Remove the password from the user object before sending response
        const { password: userPassword, verifyToken_token, ...otherDetails } = user;
        // Send user details and token

        return res
        .cookie("access_token", token, {
            httpOnly: true, // Prevents client-side JavaScript access (critical security measure)
            // secure: true, // Use this in production with HTTPS
            maxAge: 3600000 // 1 hour expiration (example)
        })
        .status(200)
        .json(otherDetails); 
        
    });
});


// NEW ROUTE: Verify Email Token
// Endpoint: GET /api/auth/verify?token=...
router.get("/verify", (_req, res) => {
    const token = _req.query.token;

    if (!token) {
        // In a real app, redirect to an error page
        return res.status(400).send("Verification failed: Token missing.");
    }

    // 1. Find user by verification token
    const q = "SELECT * FROM users WHERE verification_token = ?";
    
    db.query(q, [token], (err, data) => {
        if (err) {
            console.error("DB error on verification:", err);
            return res.status(500).send("Verification failed due to server error.");
        }

        if (data.length === 0) {
            // Redirect to an error page or a message saying the link is invalid/expired
            return res.status(404).send("Verification failed: Invalid or expired token.");
        }

        const userId = data[0].id;

        // 2. Update user status: Set is_verified = 1 and clear the verification_token
        const updateQuery = "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?";
        
        db.query(updateQuery, [userId], (err, _updateData) => {
            if (err) {
                console.error("DB error on verification update:", err);
                return res.status(500).send("Verification failed: Could not update status.");
            }
            
            // 3. Success: Redirect or send a success message.
            // For a better UX, redirect to the login page with a success query parameter.
            // You will need to handle this redirect in your React app.
            return res.redirect("http://localhost:5173/login?verified=true");
            // Alternatively, just send a simple success message:
            // return res.status(200).send("Email successfully verified! You can now log in.");
        });
    });
});

// Display on UI
router.get("/me", verifyToken, (_req, res) => res.status(200).json({
    id: _req.user.id,
    name: _req.user.name, // Assuming you add 'name' to the JWT payload
    email: _req.user.email,
    message: "Session is valid."
}));

// PUT Update User Profile (Protected)
// Endpoint: PUT /api/auth/profile
router.put("/profile", verifyToken, (_req, res) => {
    // Only allow updating name and email. Password update is separate.
    const { name, email } = _req.body;
    const userId = _req.user.id; // User ID comes from the verified token

    // Input validation (optional but recommended)
    if (!name && !email) {
        return res.status(400).json("Please provide name or email to update.");
    }
    
    // Check if the new email is already in use by another user
    if (email) {
        const checkEmailQuery = "SELECT id FROM users WHERE email = ? AND id != ?";
        db.query(checkEmailQuery, [email, userId], (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length > 0) {
                return res.status(409).json("This email is already taken by another user.");
            }
        });
    }

    // Build the dynamic update query
    let q = "UPDATE users SET ";
    const values = [];
    const fields = [];

    if (name) {
        fields.push("`name` = ?");
        values.push(name);
    }
    if (email) {
        fields.push("`email` = ?");
        values.push(email);
    }

    // If there are fields to update, execute the query
    if (fields.length > 0) {
        q += fields.join(", ") + " WHERE id = ?";
        values.push(userId);

        db.query(q, values, (err, data) => {
            if (err) {
                console.error("User update error:", err);
                return res.status(500).json(err);
            }
            if (data.affectedRows === 0) {
                return res.status(404).json("User not found or nothing to update.");
            }
            return res.status(200).json("Profile updated successfully!");
        });
    } else {
        // Should be caught by the initial validation, but included for completeness
        return res.status(200).json("No changes provided.");
    }
});


// Logout user
router.post("/logout", (_req, res) => {
    return res
    .clearCookie("access_token", {
        httpOnly: true,
        secure: true, // Use this in production with HTTPS
        sameSite: "none" // Adjust based on your requirements
    })
    .status(200)
    .json("User has been logged out.");
})

// Endpoint: DELETE /api/auth/delete
router.delete("/delete", verifyToken, (_req, res) => {
    const userId = _req.user.id; // User ID comes from the verified token

    // CRITICAL: You should also delete associated data (bookings, wishlists) 
    // or set up CASCADE DELETE in your DB schema. We'll just delete the user for now.
    const q = "DELETE FROM users WHERE id = ?";

    db.query(q, [userId], (err, data) => {
        if (err) {
            console.error("User deletion error:", err);
            return res.status(500).json(err);
        }
        if (data.affectedRows === 0) {
            return res.status(404).json("User account not found.");
        }
        
        // Clear the cookie immediately upon successful deletion
        return res
            .clearCookie("access_token", {
                httpOnly: true,
                secure: true, 
                sameSite: "none" 
            })
            .status(200)
            .json("User account deleted successfully. Goodbye!");
    });
});

export default router;