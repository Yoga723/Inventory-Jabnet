/**
 * @file backend/routes/customerRoutes.js
 * @route /backend/api/customers/
 * @description Routes untuk managing customers (list_customers).
 * @requires express
 * @requires ../middleware/auth
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid"); // Import uuid
const { authenticateMiddleware, authorize } = require("../../middleware/auth");
const router = express.Router();

router.use(authenticateMiddleware);

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  const { search, sortBy = "last_edited", sortOrder = "DESC", olt, odp, id_paket, id_mitra } = req.query;

  try {
    let countQueryString = `SELECT COUNT(DISTINCT c.id) as count FROM customers c
      LEFT JOIN paket_internet p ON c.id_paket = p.id_paket
      LEFT JOIN list_mitra m ON c.id_mitra = m.id_mitra`;
    let customersQueryString = `
      SELECT 
        c.*, p.nama_paket, p.harga_paket, p.kecepatan_paket, p.comment_paket,
        m.nama_mitra, m.comment_mitra
      FROM customers c
      LEFT JOIN paket_internet p ON c.id_paket = p.id_paket
      LEFT JOIN list_mitra m ON c.id_mitra = m.id_mitra`;

    const params = [];
    const whereClauses = [];

    if (search) {
      whereClauses.push(
        `(c.id LIKE ? OR c.name LIKE ? OR c.no_telepon LIKE ? OR c.address LIKE ? OR c.sn LIKE ? OR p.nama_paket LIKE ? OR m.nama_mitra LIKE ?)`
      );
      const searchValue = `%${search}%`;
      for (let i = 0; i < 7; i++) params.push(searchValue);
    }
    if (olt) {
      whereClauses.push(`c.olt = ?`);
      params.push(olt);
    }
    if (odp) {
      whereClauses.push(`c.odp LIKE ?`);
      params.push(`%${odp}%`);
    }
    if (id_paket) {
      whereClauses.push(`c.id_paket = ?`);
      params.push(id_paket);
    }
    if (id_mitra) {
      whereClauses.push(`c.id_mitra = ?`);
      params.push(id_mitra);
    }

    if (whereClauses.length > 0) {
      const whereString = ` WHERE ${whereClauses.join(" AND ")}`;
      countQueryString += whereString;
      customersQueryString += whereString;
    }

    // --- Get Total Count ---
    const [countResult] = await req.dbPelanggan.query(countQueryString, params);
    const totalCustomers = countResult ? countResult.count : 0;

    // --- Add Sorting and Pagination for the main query ---
    const validSortColumns = ["last_edited", "name", "id"];
    const safeSortBy = validSortColumns.includes(sortBy) ? `c.${sortBy}` : "c.last_edited";
    const safeSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    customersQueryString += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const flatCustomers = await req.dbPelanggan.query(customersQueryString, params);

    // --- DATA TRANSFORMATION ---
    // Map hasil flat database jadi nested JSON.
    const nestedCustomers = flatCustomers.map((customer) => {
      const {
        id_paket,
        nama_paket,
        harga_paket,
        kecepatan_paket,
        comment_paket,
        id_mitra,
        nama_mitra,
        comment_mitra,
        ...customerDetails
      } = customer;
      return {
        ...customerDetails,
        paket: id_paket
          ? {
              id_paket,
              nama_paket,
              harga_paket,
              kecepatan_paket,
              comment_paket,
            }
          : null,
        mitra: id_mitra ? { id_mitra, nama_mitra, comment_mitra } : null,
      };
    });

    res.status(200).json({
      data: nestedCustomers,
      pagination: { page, limit, total: totalCustomers },
    });
  } catch (err) {
    console.log("ERROR DI GET CUSTOMERS :", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const { id, name, no_telepon, address, email, sn, olt, odp, port_odp, id_paket, id_mitra } = req.body;

  try {
    if (!id) id = uuidv4();

    if (!name || !no_telepon) return res.status(400).json({ error: "Nama dan Nomor HP diperlukan" });

    await req.dbPelanggan.query(
      "INSERT INTO customers (id, name, no_telepon, email, address, sn, olt, odp, port_odp, id_paket, id_mitra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, no_telepon, email || null, address, sn, olt, odp, port_odp, id_paket || null, id_mitra || null]
    );

    const [newCustomer] = await req.dbPelanggan.query("SELECT * FROM customers WHERE id = ?", [id]);

    res.status(201).json(newCustomer);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "ID Pelanggan sudah digunakan" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const originalCustomerId = req.params.id;
  const { id, name, no_telepon, address, sn, olt, odp, port_odp, id_paket, id_mitra } = req.body;
  console.log("THIS IS ORIGINAL ID", originalCustomerId);
  try {
    if (!name || !no_telepon) return res.status(400).json({ error: "Name and phone number are required" });
    const updateQuery = `
          UPDATE customers 
          SET id = ?, name = ?, no_telepon = ?, address = ?, email = ?, sn = ?, olt = ?, odp = ?, port_odp = ?, id_paket = ?, id_mitra = ? 
          WHERE id = ?`;

    const updateResult = await req.dbPelanggan.query(updateQuery, [
      id,
      name,
      no_telepon,
      address,
      email || null,
      sn,
      olt,
      odp,
      port_odp,
      id_paket || null,
      id_mitra || null,
      originalCustomerId,
    ]);

    if (updateResult.affectedRows === 0)
      return res.status(404).json({ error: `Customer with ID ${originalCustomerId} not found.` });

    const [updatedCustomer] = await req.dbPelanggan.query("SELECT * FROM customers WHERE id = ?", [id]);
    res.status(200).json(updatedCustomer);
  } catch (err) {
    console.error("Error updating customer:", err.message);
    res.status(500).json({
      error: "An unexpected error occurred while updating the customer.",
    });
  }
});

router.delete("/:id", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.dbPelanggan.query("DELETE FROM customers WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: `Customer with ID ${id} not found.` });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
