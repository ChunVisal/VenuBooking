// backend/routes/auth.js
import express from "express";
import db from "../config/db.js"; // PostgreSQL pool
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { upload } from "../config/cloudinary.js"; // Cloudinary upload middleware
import { verifyToken } from "../middleware/verifyToken.js";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// ----------------- Helpers -----------------
const issueJwtAndRespond = (res, user, message = "Success 🍏") => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "365d" },
  );

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // also fixed spelling
  });

  res.json({
    message: "Login successful ✅",
    user,
    token,
  });
};

// ----------------- Test -----------------
router.get("/test", (_req, res) => {
  res.send("Auth route is working! 🙋‍♂️");
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/api/auth/google/callback",
);

router.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
});

// Google Login
router.post("/google-login", async (req, res) => {
  const { credential } = req.body;
  if (!credential)
    return res.status(400).json({ message: "No credential provided" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name: username } = ticket.getPayload();

    let { rows } = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    let user = rows[0];

    if (!user) {
      const result = await db.query(
        "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
        [username, email],
      );
      user = result.rows[0];
    }

    // Use our helper to ensure the token is sent!
    issueJwtAndRespond(res, user, "Google login successful ✅");
  } catch (err) {
    res.status(400).json({ message: "Invalid Google credential" });
  }
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  const { tokens } = oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Optional: fetch user info
  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();

  // TODO: issue JWT for your app and respond
  res.json({ message: "Google login successful", user: data });
});

// ----------------- Register -----------------
router.post("/register", async (req, res) => {
  const { username, email, password, bio, job, address, message } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Fill all required fields 😿" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const insertQ = `
      INSERT INTO users
        (username,email,password,bio,job,address,message, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7, NOW(), NOW())
      RETURNING id, username, email, bio, job, address, message, created_at
    `;

    const result = await db.query(insertQ, [
      username,
      email,
      hashed,
      bio || "",
      job || "",
      address || "",
      message || "",
    ]);
    res.status(201).json({
      message: "User registered ✅",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({ message: "Error registering user 😭", error: err.message });
  }
});

// ----------------- Login -----------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Fill all required fields 😿" });

  try {
    const selectQ = "SELECT * FROM users WHERE email=$1";
    const { rows } = await db.query(selectQ, [email]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "User not found 😢" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Wrong password 😭" });

    issueJwtAndRespond(res, user, "Login successful ✅");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed 😭", error: err.message });
  }
});

// ----------------- Get current user -----------------
router.get("/me", verifyToken, async (req, res) => {
  try {
    const selectQ = "SELECT * FROM users WHERE id=$1";
    const { rows } = await db.query(selectQ, [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "User not found 😢" });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        job: user.job,
        address: user.address,
        message: user.message,
        profile_image: user.profile_image,
        background_image: user.background_image,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Cannot fetch user 😭", error: err.message });
  }
});

// ----------------- Update user -----------------
router.put("/update", verifyToken, async (req, res) => {
  const { username, bio, job, address, message, password } = req.body;
  const id = req.user.id;

  const fields = [];
  const values = [];
  let count = 1;

  if (username) {
    fields.push(`username=$${count}`);
    values.push(username);
    count++;
  }
  if (bio) {
    fields.push(`bio=$${count}`);
    values.push(bio);
    count++;
  }
  if (job) {
    fields.push(`job=$${count}`);
    values.push(job);
    count++;
  }
  if (address) {
    fields.push(`address=$${count}`);
    values.push(address);
    count++;
  }
  if (message) {
    fields.push(`message=$${count}`);
    values.push(message);
    count++;
  }
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    fields.push(`password=$${count}`);
    values.push(hashed);
    count++;
  }

  if (fields.length === 0)
    return res.status(400).json({ message: "Nothing to update 😿" });

  values.push(id);
  const query = `UPDATE users SET ${fields.join(", ")} WHERE id=$${count} RETURNING *`;

  try {
    const { rows } = await db.query(query, values);
    res.json({ message: "User updated ✅", user: rows[0] });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed 😭", error: err.message });
  }
});

// ----------------- Upload profile/background image -----------------
router.put(
  "/upload/profile",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const imageUrl = req.file.path;
      const userId = req.user.id;

      // Ensure the column name matches your PostgreSQL table exactly!
      const updateQuery = `
            UPDATE users 
            SET profile_image = $1 
            WHERE id = $2 
            RETURNING id, username, email, profile_image, background_image, bio, job, address
        `;

      const { rows } = await db.query(updateQuery, [imageUrl, userId]);

      if (rows.length === 0)
        return res.status(404).json({ message: "User not found" });

      res.status(200).json({
        message: "Profile photo updated! 📸",
        user: rows[0], // Return the updated user object
      });
    } catch (error) {
      console.error("Profile Upload Error:", error);
      res.status(500).json({ message: "Server error during profile upload" });
    }
  },
);

// ----------------- Logout -----------------
router.post("/logout", (_req, res) => {
  return res.clearCookie("access_token").status(200).json("Logged out ✅");
});

// ----------------- Delete account -----------------
router.delete("/delete", verifyToken, async (req, res) => {
  const id = req.user.id;
  try {
    const delQ = "DELETE FROM users WHERE id=$1 RETURNING *";
    const { rows } = await db.query(delQ, [id]);
    if (!rows[0]) return res.status(404).json({ message: "User not found 😢" });

    res
      .clearCookie("access_token")
      .json({ message: "Account deleted ✅", user: rows[0] });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed 😭", error: err.message });
  }
});

export default router;
