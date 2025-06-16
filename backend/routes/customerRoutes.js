const express = require("express");
const { authenticateMiddleware, authorize } = require("../middleware/auth");
const { json } = require("body-parser");
const router = express.Router();

router.use(authenticateMiddleware);

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  // Calculate offset SQL query
  const offset = (page - 1) * limit;

  try {
    const [totalResult] = await req.dbPelanggan.query(
      `SELECT COUNT(*) as count FROM customers`
    );
    const totalCustomers = totalResult ? totalResult.count : 0;

    const customers = await req.dbPelanggan.query(
      `SELECT * FROM customers ORDER BY id LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // const response = JSON.stringify(customers);

    res.status(201).json({
      data: customers,
      pagination: { page: page, limit: limit, total: totalCustomers },
    });
  } catch (err) {
    console.log("ERROR DI GET CUSTOMERS :", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
