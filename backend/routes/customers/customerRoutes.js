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
    const baseSelect = `
      SELECT 
        c.*, 
        p.nama_paket, p.harga_paket, p.kecepatan_paket, p.comment_paket,
        m.nama_mitra, m.comment_mitra
      FROM customers c
      LEFT JOIN paket_internet p ON c.id_paket = p.id_paket
      LEFT JOIN list_mitra m ON c.id_mitra = m.id_mitra`;

    const baseCount = `
      SELECT COUNT(DISTINCT c.id) AS count
      FROM customers c
      LEFT JOIN paket_internet p ON c.id_paket = p.id_paket
      LEFT JOIN list_mitra m ON c.id_mitra = m.id_mitra`;

    const whereClauses = [];
    const params = [];

    // --- Search Filters ---
    const searchableFields = [
      "c.id",
      "c.name",
      "c.email",
      "c.no_telepon",
      "c.address",
      "c.sn",
      "p.nama_paket",
      "m.nama_mitra",
    ];

    if (search) {
      whereClauses.push(`(${searchableFields.map((field) => `${field} LIKE ?`).join(" OR ")})`);
      params.push(...Array(searchableFields.length).fill(`%${search}%`));
    }

    // --- Exact/LIKE Filters ---
    if (olt) {
      whereClauses.push("c.olt = ?");
      params.push(olt);
    }
    if (odp) {
      whereClauses.push("c.odp LIKE ?");
      params.push(`%${odp}%`);
    }
    if (id_paket) {
      whereClauses.push("c.id_paket = ?");
      params.push(id_paket);
    }
    if (id_mitra) {
      whereClauses.push("c.id_mitra = ?");
      params.push(id_mitra);
    }

    const whereSQL = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "";

    // --- Total Count ---
    const [countResult] = await req.dbPelanggan.query(baseCount + whereSQL, params);
    const totalCustomers = countResult?.count || 0;

    // --- Sorting ---
    const allowedSortFields = ["last_edited", "name", "id"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `c.${sortBy}` : "c.last_edited";
    const safeSortOrder = sortOrder.toString().toUpperCase() === "ASC" ? "ASC" : "DESC";

    // --- Final Query with Pagination ---
    const finalQuery = `
      ${baseSelect}
      ${whereSQL}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?`;

    const customerRows = await req.dbPelanggan.query(finalQuery, [...params, limit, offset]);

    // --- Format Output ---
    const customers = customerRows.map((row) => {
      const {
        id_paket,
        nama_paket,
        harga_paket,
        kecepatan_paket,
        comment_paket,
        id_mitra,
        nama_mitra,
        comment_mitra,
        ...rest
      } = row;

      return {
        ...rest,
        paket: id_paket
          ? {
              id_paket,
              nama_paket,
              harga_paket,
              kecepatan_paket,
              comment_paket,
            }
          : null,
        mitra: id_mitra
          ? {
              id_mitra,
              nama_mitra,
              comment_mitra,
            }
          : null,
      };
    });

    res.status(200).json({
      data: customers,
      pagination: {
        page,
        limit,
        total: totalCustomers,
      },
    });
  } catch (err) {
    console.error("ERROR DI GET CUSTOMERS:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const { id, name, no_telepon, address, email, sn, olt, odp, port_odp, id_paket, id_mitra } = req.body;

  try {
    if (!id) id = uuidv4();

    if (!name || !no_telepon) return res.status(400).json({ error: "Nama dan Nomor HP diperlukan" });

    const [existingCustomer] = await req.dbPelanggan.query("SELECT * FROM customers WHERE id = ?", [id]);
    if (existingCustomer) return res.status(409).json({ error: "ID Pelanggan sudah digunakan" });

    await req.dbPelanggan.query(
      "INSERT INTO customers (id, name, no_telepon, email, address, sn, olt, odp, port_odp, id_paket, id_mitra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, no_telepon, email || null, address, sn, olt, odp, port_odp, id_paket || null, id_mitra || null]
    );

    const [newCustomer] = await req.dbPelanggan.query("SELECT * FROM customers WHERE id = ?", [id]);

    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authorize(["field", "operator", "admin", "super_admin"]), async (req, res) => {
  const originalCustomerId = req.params.id;
  const { id, name, no_telepon, email, address, sn, olt, odp, port_odp, id_paket, id_mitra } = req.body;
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