// server.js
const express = require("express");
const cors = require("cors"); // CORS middleware
const { Pool } = require("pg"); // PostgreSQL pool

require("dotenv").config();
const authRoutes = require("./routes/authRoutes.js");
const recordRoutes = require("./routes/recordRoutes.js");

const app = express();
const port = process.env.PORT || 4000;

// 1) Database pool
const pool = new Pool({
  host: process.env.psqlHost,
  port: Number(process.env.psqlPort),
  database: process.env.psqlDB,
  user: process.env.psqlUser,
  password: String(process.env.psqlPass).trim(),
});

// 2) Inject pool into req
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// 3) Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://inventory.jabnet.id"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // Enable CORS
app.use(express.json()); // JSON body parser

// 4) Routes
app.use("/api/records", recordRoutes);
app.use("/api/user", authRoutes);

// 5) Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
