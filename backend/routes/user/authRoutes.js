// backend/routes/user/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken")
const router = express.Router();
const { authenticateMiddleware, authorize } = require("../../middleware/auth");

router.post("/login", async (req, res) => {
    if (!req.db) {
console.error("[AUTH] FATAL: req.db is not defined. Check database injection middleware in server.js.");
return res.status(500).json({ error: "Server configuration error: Database connection not available." });
}
  const { username, password } = req.body;

  console.log(`[AUTH] Login attempt for username: '${username}' at ${new Date().toISOString()}`);

  if (!username || !password) {
    console.log("[AUTH] Login failed: Missing username or password.");
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const sqlQuery = "SELECT * FROM users WHERE username = $1";

    // --- FIX: Use object destructuring for the 'pg' library result ---
    // The 'pg' library returns an object like { rows: [...] }, not an array.
    const { rows: users } = await req.db.query(sqlQuery, [username]);

    if (users.length === 0) {
      console.log(`[AUTH] Login failed: User '${username}' not found.`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
        if (!user.password_hash) {
      console.error(`[AUTH] FATAL: User object for '${username}' does not contain a 'password' field. Check database schema.`);
      return res.status(500).json({ error: "Server configuration error: User data is incomplete." });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log(`[AUTH] Login failed: Invalid password for user '${username}'.`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Password is correct, create JWT
    const payload = {
      user: {
        id: user.user_id,
        role: user.role,
        username: user.username,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    const userResponse = {
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    };

    // The token is sent in the response body
    // res.status(200).json({
    //   message: "Login successful",
    //   data: { token, user: userResponse },
    // });
    
    const cookieOptions = {
  httpOnly: true,
  secure: true,           // your site must be HTTPS
  sameSite: "none",       // cross‑site cookie
  domain: "inventory.jabnet.id",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

res
  .cookie("auth_token", token, cookieOptions)
  .status(200)
  .json({
    message: "Login successful",
    data: { token, user: userResponse }
  });
    
     } catch (error) {
    console.error("[AUTH] Database or server error during login:", error);
    res.status(500).json({ error: `Server ${error.name}: ${error.message}` });
  }
});


router.post("/logout", (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    path: "/",
    secure: true,
    domain: "inventory.jabnet.id",
    sameSite: "none",
    // partitioned: true,
  };

  return (
    res
      .clearCookie("auth_token", cookieOptions)
      .status(200)
      // .clearCookie("__Secure-auth_token", cookieOptions)
      .json({ status: "success", message: "Logged out" })
  );
});

router.get("/me", authenticateMiddleware, async (req, res) => {
  try {
    const { rows } = await req.db.query(
      "SELECT user_id, username, full_name, role FROM users WHERE user_id = $1",
      [req.user.user_id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ status: "success", data: rows[0] });
  } catch (error) {
    console.error("User query error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

router.get(
  "/settings",
  authenticateMiddleware,
  authorize(["admin", "super_admin"]),
  async (req, res) => {}
);

module.exports = router;
