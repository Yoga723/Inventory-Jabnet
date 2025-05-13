const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const { search, status, start_date, end_date } = req.query;
    let baseQuery = "SELECT * FROM catatan";
    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(nama ILIKE $${values.length} OR list_barang::text ILIKE $${values.length})`);
    }

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (start_date && end_date) {
      values.push(start_date);
      values.push(end_date);
      conditions.push(`tanggal BETWEEN $${values.length - 1}::timestamp AND $${values.length}::timestamp`);
    }

    if (conditions.length) baseQuery += " WHERE " + conditions.join(" AND ");

    baseQuery += " ORDER BY tanggal DESC";

    const result = await req.db.query(baseQuery, values);
    res.json({ status: "success", data: result.rows });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Failed to retrieve catatan" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const paramId = req.params.id;
    if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });

    const query = "SELECT * FROM catatan WHERE record_id = $1";
    const result = await req.db.query(query, [paramId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Record not found" });

    res.json({ status: "success", data: result.rows[0] });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Failed to retrieve catatan" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const paramId = req.params.id;
    if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });

    const { nama, nilai, list_barang, lokasi, status, keterangan } = req.body;

    // Enhanced validation
    const numericValue = Number(nilai);
    if (isNaN(numericValue)) {
      return res.status(400).json({ error: "Nilai must be a valid number" });
    }
    if (Math.abs(numericValue) > 9999999999.99) {
      return res.status(400).json({
        error: "Nilai cannot exceed 9,999,999,999.99",
      });
    }

    // Use transaction for safety
    await req.db.query("BEGIN");
    const query = `UPDATE catatan SET nama = $1, nilai = $2, list_barang = $3::JSONB, 
                  lokasi = $4, status = $5, keterangan = $6 
                  WHERE record_id = $7 RETURNING *`;
    const value = [nama, nilai, list_barang, lokasi, status, keterangan || null, paramId];

    const result = await req.db.query(query, value);
    await req.db.query("COMMIT");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Berhasil Update data",
      data: result.rows[0],
    });
  } catch (error) {
    await req.db.query("ROLLBACK");
    console.error("Database error:", error);

    if (error.code === "22003") {
      // Specific numeric overflow code
      res.status(400).json({
        error: "Nilai terlalu besar. Maksimum 9,999,999,999.99",
      });
    } else {
      res.status(500).json({
        error: "Terjadi kesalahan server",
      });
    }
  }
});

router.post("/", async (req, res) => {
  try {
    const { nama, nilai, list_barang, lokasi, status, keterangan } = req.body;

    // Validate required fields
    if (!nama || !status || !list_barang || !lokasi) return res.status(400).json({ error: "All fields are required" });
    const query = `INSERT INTO catatan(nama, nilai, list_barang, lokasi, status, keterangan) VALUES ($1, $2, $3::JSONB, $4, $5, $6) RETURNING *`;

    const values = [nama, nilai, list_barang, lokasi, status, keterangan || null];
    const result = await req.db.query(query, values);

    res.status(200).json({
      status: 200,
      message: "Data berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ error: `Failed to create record, ${error}` });
  }
});

router.delete(`/:id`, async (req, res) => {
  try {
    const paramId = parseInt(req.params.id);
    if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });
    const query = `DELETE FROM catatan WHERE record_id = $1 RETURNING *`;

    const result = await req.db.query(query, [paramId]);
    res.status(200).json({ status: 200, message: "Berhasil Hapus Data !!", data: result.rows[0] });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ error: `Failed to delete record, ${error}` });
  }
});

module.exports = router;
