// backend/routes/index.js
const express = require("express");
const authRoutes = require("./authRoutes");
const recordRoutes = require("./recordRoutes");
const customersRoute = require("./customerRoutes");
const productsRoute = require("./productRoutes");

const router = express.Router();
router.use("/user", authRoutes); // jadi /api/user/…
router.use("/records", recordRoutes); // jadi /api/records/…
router.use("/products", productsRoute); // jadi /api/products/…
router.use("/customers", customersRoute); // jadi /api/customers/....

module.exports = router;
