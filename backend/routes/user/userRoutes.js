const express = require("express");
const router = express.Router();
const pool = require("../config/dbinventory"); // Using inventory DB pool
const { authenticateToken, isAdminOrSuperAdmin } = require("../middleware/auth");

// Apply authentication and admin authorization to all routes in this file
router.use(authenticateToken);
router.use(isAdminOrSuperAdmin);

// GET all users
router.get("/", async (req, res) => {
  try {
    const allUsers = await pool.query(
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
    const newUser = await pool.query(
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
      // If password is being updated, the trigger will hash it
      updatedUser = await pool.query(
        "UPDATE users SET username = $1, password_hash = $2, full_name = $3, role = $4 WHERE user_id = $5 RETURNING user_id, username, full_name, role",
        [username, password, full_name, role, id]
      );
    } else {
      // If password is not being updated
      updatedUser = await pool.query(
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

    // Prevent users from deleting themselves
    if (parseInt(id, 10) === req.user.user_id) {
        return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const deleteOp = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING user_id", [id]);

    if (deleteOp.rowCount === 0) {
        return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;