const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// POST /api/user/login
router.post("/login", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error("Missing JWT in .env!!!");
    const { username, password } = req.body;
    // 1) Look up user
    const { rows } = await req.db.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = rows[0];
    // 2) Validate password
    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // 3) Sign JWT
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // 4) Set HTTP-only cookie
    res
      .cookie("auth_token", token, {
        httpOnly: true,
        domain: "inventory.jabnet.id",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        // maxAge: 3600 * 1000, // 1 hour
      })
      .json({ status: "success", data: token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
