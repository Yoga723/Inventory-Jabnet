// backend/routes/authRoutes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateMiddleware, authorize } = require("../../middleware/auth");

module.exports = (db) => {
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
    if (process.env.NODE_ENV === "production") {
      // Production logging logic here
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
      return {
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "none",
        partitioned: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
    } else if (isProduction) {
      return {
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "none",
        partitioned: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
    } else {
      return {
        httpOnly: true,
        path: "/",
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
    }
  };

  router.post("/login", async (req, res) => {
    try {
      if (!process.env.JWT_SECRET) throw new Error("Missing JWT in .env!!!");
      const { username, password } = req.body;
      
      // --- CHANGE 2: Use the 'db' variable directly, not 'req.db' ---
      const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = rows[0];

      if (!user) return res.status(401).json({ error: "Incorrect username or password", status: 401 });

      const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordCorrect) return res.status(401).json({ error: "Incorrect username or password", status: 401 });

      const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
      const cookieOptions = getCookieOptions(req);
      const isDev = isDevRequest(req);

      logAuthenticationEvent(req, "LOGIN_SUCCESS", {
        userId: user.user_id,
        role: user.role,
        isDevelopmentRequest: isDev,
        cookieConfig: { sameSite: cookieOptions.sameSite, secure: cookieOptions.secure },
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
    return res.clearCookie("auth_token", cookieOptions).status(200).json({ status: "success", message: "Logged out" });
  });

  router.get("/me", authenticateMiddleware, async (req, res) => {
    try {
      // --- CHANGE 3: Use the 'db' variable here as well ---
      const { rows } = await db.query("SELECT user_id, username, full_name, role FROM users WHERE user_id = $1", [
        req.user.user_id,
      ]);

      if (!rows.length) return res.status(404).json({ error: "User not found" });

      res.json({ status: "success", data: rows[0] });
    } catch (error) {
      console.error("User query error:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  router.get("/settings", authenticateMiddleware, authorize(["admin", "super_admin"]), async (req, res) => {
    // Your settings logic here
  });

  // --- CHANGE 4: Return the router at the end of the function ---
  return router;
};