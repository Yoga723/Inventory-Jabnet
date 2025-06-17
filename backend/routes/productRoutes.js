// ROUTER UNTUK KATEGORI DAN PRODUCT
// BASE PATH /api/products
const router = require("express").Router();
const { authenticateMiddleware, authorize } = require("../middleware/auth");

router.use(authenticateMiddleware);
// ===============================================================
// ROUTES UNTUK LIST PILIHAN PRODUCTS/ITEMS/BARANG YANG ADA
// ===============================================================

// Get items by category ID
router.get("/", async (req, res) => {
  try {
    const { kategori_id } = req.query;
    if (kategori_id) {
      const query = "SELECT item_id, item_name FROM barang WHERE kategori_id = $1 ORDER BY item_name";
      const result = await req.db.query(query, [kategori_id]);
      res.json(result.rows);
    } else {
      // return res.status(400).json({ error: "kategori_id is required" });
      const query = `
      SELECT 
        b.item_id, 
        b.item_name, 
        b.kategori_id, 
        b.stock,
        k.nama_kategori,
        b.created_at
      FROM barang b
      JOIN kategori k ON b.kategori_id = k.kategori_id
      ORDER BY b.item_name
    `;
      const result = await req.db.query(query);
      res.json(result.rows);
    }
    res.status(500).json({ error: error.message });
  } catch (error) {}
});

router.post("/", authorize(["admin", "super_admin"]), async (req, res) => {
  const { item_name, kategori_id } = req.body;

  try {
    // Validate input
    if (!item_name || !kategori_id) {
      return res.status(400).json({
        error: "item_name and kategori_id are required",
        code: 400,
      });
    }

    // Check if category exists
    const categoryCheck = await req.db.query("SELECT kategori_id FROM kategori WHERE kategori_id = $1", [kategori_id]);

    if (categoryCheck.rowCount === 0) {
      return res.status(404).json({
        error: "Category not found",
        code: 404,
      });
    }

    const result = await req.db.query(
      `INSERT INTO barang (item_name, kategori_id) VALUES ($1, $2) RETURNING item_id, item_name, kategori_id, created_at`,
      [item_name, kategori_id]
    );

    return res.status(201).json({
      data: result.rows[0],
      code: 201,
      message: "Berhasil Menambah barang baru",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal menambahkan barang baru !",
      error: error.message,
      code: 500,
    });
  }
});

router.put("/:id", authorize(["admin", "super_admin"]), async (req, res) => {
  const paramId = parseInt(req.params.id);
  const { item_name, kategori_id } = req.body;

  try {
    // Check if category exists
    const categoryCheck = await req.db.query("SELECT kategori_id FROM kategori WHERE kategori_id = $1", [kategori_id]);

    if (categoryCheck.rowCount === 0) {
      return res.status(404).json({
        error: "Category not found",
        code: 404,
      });
    }

    // UPDATE BARANG
    const result = await req.db.query(
      `UPDATE barang SET item_name = $1, kategori_id = $2 WHERE item_id = $3 RETURNING item_name, kategori_id, created_at`,
      [item_name, kategori_id, paramId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found", code: 404 });
    }

    return res.status(200).json({
      message: "BERHASIL UPDATE BARANG",
      code: 200,
      data: result.rows[0],
    });
  } catch (error) {
    return res.json({
      message: "Gagal Update Barang!",
      code: 500,
      error: error.message,
    });
  }
});

router.delete(`/:id`, authorize(["admin", "super_admin"]), async (req, res) => {
  try {
    const paramId = parseInt(req.params.id);
    if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });
    const query = `DELETE FROM barang WHERE item_id = $1 RETURNING * `;
    const result = await req.db.query(query, [paramId]);

    return res.status(200).json({
      message: "BERHASIL HAPUS BARANG",
      code: 200,
      data: result.rows[0],
    });
  } catch (error) {
    return res.json({
      message: "Gagal Menghapus Barang",
      error: error,
      code: 500,
    });
  }
});

// ===============================================================
// ROUTES UNTUK KATEGORI
// ===============================================================

router.get("/kategori", async (req, res) => {
  try {
    const query = "SELECT kategori_id, nama_kategori FROM kategori ORDER BY nama_kategori";
    const result = await req.db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/kategori", authorize(["admin", "super_admin"]), async (req, res) => {
  const { nama_kategori } = req.body;
  if (!nama_kategori) return res.status(400).json({ error: "nama_kategori is required" });

  try {
    const query = `INSERT INTO kategori (nama_kategori) VALUES ($1) RETURNING *`;
    const result = await req.db.query(query, [nama_kategori]);
    res.status(201).json({
      message: "Category created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/kategori/:id", authorize(["admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  if (!nama_kategori) return res.status(400).json({ error: "nama_kategori is required" });

  try {
    const query = `UPDATE kategori SET nama_kategori = $1 WHERE kategori_id = $2 RETURNING *`;
    const result = await req.db.query(query, [nama_kategori, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({
      message: "Category updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/kategori/:id", authorize(["admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const query = `DELETE FROM kategori WHERE kategori_id = $1 RETURNING *`;
    const result = await req.db.query(query, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Category not found" });

    res.status(200).json({
      message: "BERHASIL HAPUS KATEGORI",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category", details: error.message });
  }
});

module.exports = router;
