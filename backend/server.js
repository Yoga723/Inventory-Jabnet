// server.js
const express = require("express");
const cors = require("cors"); // CORS middleware
const cookieParser = require("cookie-parser");

require("dotenv").config();
const pgPool = require("./config/dbinventory");
const mariaPool = require("./config/dbcustomers");

const apiRouter = require("./routes/index");

const app = express();
const port = process.env.PORT || 4000;

// 3) Middleware
const corsOptions = {
  origin: true, // Allows all origins, including localhost and your domain
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "mode", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json()); // JSON body parser
app.use(cookieParser());

// INJECT DATABASE KE ROUTE
app.use((req, res, next) => {
  const path = req.originalUrl; // Use originalUrl to get the full path, e.g., /backend/api/user/login

  // --- Enhanced Logging: Check your cPanel logs for this output ---
  console.log(`[DB INJECT] Checking path: "${path}"`);

  if (
    path.startsWith("/backend/api/user") ||
    path.startsWith("/backend/api/products") ||
    path.startsWith("/backend/api/records")
  ) {
    console.log(`[DB INJECT] SUCCESS: Attaching PostgreSQL pool (pgPool).`);
    req.db = pgPool;
  } else if (
    path.startsWith("/backend/api/customers") ||
    path.startsWith("/backend/api/paket") ||
    path.startsWith("/backend/api/mitra")
  ) {
    console.log(`[DB INJECT] SUCCESS: Attaching MariaDB pool (mariaPool).`);
    req.dbPelanggan = mariaPool;
  } else {
    console.log(`[DB INJECT] FAILED: Path did not match any database routes.`);
  }
  next();
});

// 4) Routes
app.use("/backend/api", apiRouter);

// 5) Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
