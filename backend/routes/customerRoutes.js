const express = require("express");
const { authenticateMiddleware, authorize } = require("../middleware/auth");
const { json } = require("body-parser");
const router = express.Router();

router.use(authenticateMiddleware);

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;

  try {
    const countResult = await req.dbPelanggan.query(
      `SELECT COUNT(*) as count FROM customers`
    );
    const totalCustomers = countResult[0] ? countResult[0].count : 0;

    const customers = await req.dbPelanggan.query(
      `SELECT * FROM customers ORDER BY last_edited DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.status(200).json({
      data: customers,
      pagination: { page: page, limit: limit, total: totalCustomers },
    });
  } catch (err) {
    console.log("ERROR DI GET CUSTOMERS :", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/",
  authorize(["field", "operator", "admin", "super_admin"]),
  async (req, res) => {
    const { id, name, no_telepon, address, sn, olt, odp, port_odp, paket_id } =
      req.body;

    try {
      if (!id || !name || !no_telepon)
        return res
          .status(400)
          .json({ error: "ID, Nama dan Nomor HP diperlukan" });

      await req.dbPelanggan.query(
        "INSERT INTO customers (id, name, no_telepon, address, sn, olt, odp, port_odp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, no_telepon, address, sn, olt, odp, port_odp]
      );

      const [newCustomer] = await req.dbPelanggan.query(
        "SELECT * FROM customers WHERE id = ?",
        [id]
      );

      res.status(201).json(newCustomer);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "ID Pelanggan sudah digunakan" });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/:id",
  authorize(["field", "operator", "admin", "super_admin"]),
  async (req, res) => {
    const originalCustomerId = req.params.id;
    const { id, name, no_telepon, address, sn, olt, odp, port_odp, id_paket } = req.body;

    try {
      if (!name || !no_telepon)
        return res
          .status(400)
          .json({ error: "Name and phone number are required" });

      const updateResult = await req.dbPelanggan.query(
        "UPDATE customers SET id = ?, name = ?, no_telepon = ?, address = ?, sn = ?, olt = ?, odp = ?, port_odp = ? WHERE id = ?",
        [
          id,
          name,
          no_telepon,
          address,
          sn,
          olt,
          odp,
          port_odp,
          originalCustomerId,
        ]
      );

      if (updateResult.affectedRows === 0)
        return res
          .status(404)
          .json({ error: `Customer with ID ${originalCustomerId} not found.` });

      const result = await req.dbPelanggan.query(
        "SELECT * FROM customers WHERE id = ?",
        [id]
      );
      const updatedCustomer = result[0];

      res.status(200).json(updatedCustomer);
    } catch (err) {
      console.error("Error updating customer:", err.message);
      res.status(500).json({
        error: "An unexpected error occurred while updating the customer.",
      });
    }
  }
);

router.delete(
  "/:id",
  authorize(["field", "operator", "admin", "super_admin"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await req.dbPelanggan.query(
        "DELETE FROM customers WHERE id = ?",
        [id]
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ error: `Customer with ID ${id} not found.` });

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
