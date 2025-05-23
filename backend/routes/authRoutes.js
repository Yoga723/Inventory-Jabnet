const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateMiddleware, authorize } = require("../middleware/auth");

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
    const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // 4) Set HTTP-only cookie
    res
      .cookie("auth_token", token, {
        httpOnly: true,
        // domain: "inventory.jabnet.id",
        path: "/",
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60, // 7D
      })
      .json({
        status: "success",
        data: {
          token,
          user: { user_id: user.user_id, username: user.username, full_name: user.full_name, role: user.role },
        },
      });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", authenticateMiddleware, async (req, res) => {
  const { rows } = await req.db.query("SELECT user_id, username, full_name, role FROM users WHERE user_id = $1", [
    req.user.user_id,
  ]);
  res.json({ status: "success", data: rows[0] });
});

router.get("/settings", authenticateMiddleware, authorize(["admin", "super_admin"]), async (req, res) => {});

module.exports = router;
