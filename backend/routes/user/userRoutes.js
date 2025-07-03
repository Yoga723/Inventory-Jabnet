// backend/routes/userRoutes.js

const express = require("express");
const { authenticateToken, isAdminOrSuperAdmin } = require("../middleware/auth");

// Change this file to export a function that accepts 'db'
module.exports = (db) => {
  const router = express.Router();

  // Apply middleware
  router.use(authenticateToken);
  router.use(isAdminOrSuperAdmin);

  // GET all users
  router.get("/", async (req, res) => {
    try {
      // Use the passed-in 'db' object, not 'pool'
      const allUsers = await db.query(
        "SELECT user_id, username, full_name, role, created_at FROM users ORDER BY user_id ASC"
      );
      res.json(allUsers.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

  // POST a new user
  router.post("/", async (req, res) => {
    try {
      const { username, password, full_name, role } = req.body;
      // Use the passed-in 'db' object
      const newUser = await db.query(
        "INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, full_name, role",
        [username, password, full_name, role]
      );
      res.json(newUser.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

  // PUT (update) a user
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, full_name, role } = req.body;
      let updatedUser;

      if (password) {
        // Use the passed-in 'db' object
        updatedUser = await db.query(
          "UPDATE users SET username = $1, password_hash = $2, full_name = $3, role = $4 WHERE user_id = $5 RETURNING user_id, username, full_name, role",
          [username, password, full_name, role, id]
        );
      } else {
        // Use the passed-in 'db' object
        updatedUser = await db.query(
          "UPDATE users SET username = $1, full_name = $2, role = $3 WHERE user_id = $4 RETURNING user_id, username, full_name, role",
          [username, full_name, role, id]
        );
      }

      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

  // DELETE a user
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (parseInt(id, 10) === req.user.user_id) {
        return res.status(400).json({ message: "You cannot delete your own account." });
      }
      // Use the passed-in 'db' object
      const deleteOp = await db.query("DELETE FROM users WHERE user_id = $1 RETURNING user_id", [id]);
      if (deleteOp.rowCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

  return router;
};