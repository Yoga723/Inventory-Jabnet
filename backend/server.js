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
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://inventory.jabnet.id",
      "https://inventory.jabnet.id",
      "https://103.194.47.162",
      "http://172.16.86.29",
      "https://172.16.86.29",
      "172.16.86.29",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "mode"],
    exposedHeaders: ["Set-Cookie"],
  })
); // Enable CORS

app.use(express.json()); // JSON body parser
app.use(cookieParser());

// INJECT DATABASE KE ROUTE
app.use("/api/records", (req, res, next) => {
  req.db = pgPool;            // inventory (Postgres)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/products", (req, res, next) => {
  req.db = pgPool;            // inventory (Postgres)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/user", (req, res, next) => {
  req.db = pgPool;            // inventory (Postgres)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/customers", (req, res, next) => {
  req.dbPelanggan = mariaPool; // pelanggan (MariaDB)
  next();
});

// 4) Routes
app.use("/api", apiRouter);

// 5) Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
