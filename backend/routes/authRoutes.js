// backend/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateMiddleware, authorize } = require("../middleware/auth");

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";

const logAuthenticationEvent = (req, eventType, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    origin: req.get("Origin"),
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    ...details,
  };

  console.log("AUTH_EVENT:", JSON.stringify(logEntry));

  // In production, consider sending to a monitoring service
  if (process.env.NODE_ENV === "production") {
    // Send to monitoring service (e.g., DataDog, New Relic, etc.)
  }
};

const isDevRequest = (req) => {
  const origin = req.get("Origin") || req.get("Referer");
  return (
    origin &&
    (origin.includes("localhost:3000") ||
      origin.includes("127.0.0.1:3000") ||
      origin.includes("localhost:3001") ||
      origin.includes("127.0.0.1:3001"))
  );
};

const getCookieOptions = (req) => {
  const isDev = isDevRequest(req);

  if (isProduction && isDev) {
    // Production backend serving development frontend
    return {
      httpOnly: true,
      path: "/",
      secure: true, // Keep secure for HTTPS production backend
      sameSite: "none", // Allow cross-site requests from dev environment
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  } else if (isProduction) {
    // Production backend serving production frontend
    return {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  } else {
    // Development backend
    return {
      httpOnly: true,
      path: "/",
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }
};

// POST /api/user/login
router.post("/login", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error("Missing JWT in .env!!!");
    const { username, password } = req.body;
    // 1) Look up user
    const { rows } = await req.db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    const user = rows[0];

    if (!user)
      return res
        .status(401)
        .json({ error: "Incorrect username or password", status: 401 });

    // 2) Validate password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!isPasswordCorrect)
      return res
        .status(401)
        .json({ error: "Incorrect username or password", status: 401 });

    // 3) Sign JWT
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // 4) Set HTTP-only cookie

    const cookieOptions = getCookieOptions(req);

    const isDev = isDevRequest(req);

    logAuthenticationEvent(req, "LOGIN_SUCCESS", {
      userId: user.user_id,
      role: user.role,
      isDevelopmentRequest: isDev,
      cookieConfig: {
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
      },
    });

    res.cookie("auth_token", token, cookieOptions).json({
      status: "success",
      data: {
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("Login route error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/logout", (req, res) => {
  const cookieOptions = getCookieOptions(req);

  return res
    .clearCookie("auth_token", cookieOptions)
    .status(200)
    .json({ status: "success", message: "Logged out" });
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
