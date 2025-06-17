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
    const [totalResult] = await req.dbPelanggan.query(`SELECT COUNT(*) as count FROM customers`);
    const totalCustomers = totalResult ? totalResult.count : 0;

    const customers = await req.dbPelanggan.query(`SELECT * FROM customers ORDER BY id LIMIT ? OFFSET ?`, [
      limit,
      offset,
    ]);

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

router.post("/", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const { name, no_telepon, address, sn, olt, odp, port_odp, paket_id } = req.body;
  try {
    if (!name || !no_telepon) return res.status(400).json({ error: "Nama dan Nomor HP diperlukan" });

    const result = await req.dbPelanggan.query(
      "INSERT INTO customers (name, no_telepon, address, sn, olt, odp, port_odp, paket_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, no_telepon, address, sn, olt, odp, port_odp, paket_id]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, no_telepon, address, sn, olt, odp, port_odp, paket_id } = req.body;
  try {
    if (!name || !no_telepon) return res.status(400).json({ error: "Name and phone number are required" });

    await req.dbPelanggan.query(
      "UPDATE customers SET name = ?, no_telepon = ?, address = ?, sn = ?, olt = ?, odp = ?, port_odp = ?, paket_id = ? WHERE id = ?",
      [name, no_telepon, address, sn, olt, odp, port_odp, paket_id, id]
    );
    res.status(200).json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    await req.dbPelanggan.query("DELETE FROM customers WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
