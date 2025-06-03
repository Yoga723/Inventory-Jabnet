// server.js
const express = require("express");
const cors = require("cors"); // CORS middleware
const cookieParser = require("cookie-parser");
const { Pool } = require("pg"); // PostgreSQL pool

require("dotenv").config();
const apiRouter = require("./routes/index.js");

const app = express();
const port = process.env.PORT || 4000;

// 1) Database pool
const pool = new Pool({
  host: process.env.PSQLHOST,
  port: Number(process.env.PSQLPORT),
  database: process.env.PSQLDB,
  user: process.env.PSQLUSER,
  password: String(process.env.PSQLPASS).trim(),
});

// 2) Inject pool into req
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// 3) Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://inventory.jabnet.id",
      "https://inventory.jabnet.id",
      "https://103.194.47.162",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "mode"],
  })
); // Enable CORS
app.use(express.json()); // JSON body parser
app.use(cookieParser());

// 4) Routes
app.use("/api", apiRouter);

// 5) Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
