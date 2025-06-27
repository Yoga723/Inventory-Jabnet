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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://localhost:3000",
        "http://localhost:3000",
        "https://localhost:3001",
        "http://localhost:3001",
        "http://localhost:4000",
        "http://inventory.jabnet.id",
        "https://inventory.jabnet.id",
        "https://103.194.47.162",
        "https://103.194.47.162:3000",
        "http://103.194.47.162:3000",
        "http://172.16.86.29",
        "https://172.16.86.29",
        "172.16.86.29",
      ];

      // Allow any localhost origin in development
      if (process.env.NODE_ENV !== "production" && origin.includes("localhost"))
        return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "mode",
      "X-Requested-With",
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

app.use(express.json()); // JSON body parser
app.use(cookieParser());

// INJECT DATABASE KE ROUTE
app.use("/api/records", (req, res, next) => {
  req.db = pgPool; // inventory (Postgres)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/products", (req, res, next) => {
  req.db = pgPool; // inventory (Postgres)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/user", (req, res, next) => {
  req.db = pgPool; // inventory (Postgres)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/customers", (req, res, next) => {
  req.dbPelanggan = mariaPool; // pelanggan (MariaDB)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/paket", (req, res, next) => {
  req.dbPelanggan = mariaPool; // pelanggan (MariaDB)
  next();
});

// INJECT DATABASE KE ROUTE
app.use("/api/mitra", (req, res, next) => {
  req.dbPelanggan = mariaPool; // pelanggan (MariaDB)
  next();
});

// 4) Routes
app.use("/api", apiRouter);

// 5) Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
