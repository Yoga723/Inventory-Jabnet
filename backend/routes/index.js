// backend/routes/index.js
const express = require("express");
const authRoutes = require("./authRoutes");
const recordRoutes = require("./recordRoutes");

const router = express.Router();
router.use("/user", authRoutes);       // jadi /api/user/…
router.use("/records", recordRoutes);  // jadi /api/records/…

module.exports = router;
