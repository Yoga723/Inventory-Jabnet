// routes/recordRoutes.js
const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const result = await req.db.query("SELECT * FROM catatan ORDER BY tanggal DESC");
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Failed to retrieve catatan" });
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

    res.status(201).json({
      status: 200,
      message: "Data berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ error: `Failed to create record, ${error}` });
  }
});

module.exports = router;
