/**
 * @file backend/routes/mitraRoutes.js
 * @route /backend/api/mitra/
 * @description Routes untuk managing mitra (list_mitra).
 * @requires express
 * @requires ../middleware/auth
 */

const express = require("express");
const { authenticateMiddleware, authorize } = require("../../middleware/auth");
const router = express.Router();

router.use(authenticateMiddleware);

/**
 * @route GET /
 * @description Get all mitra
 * @access Private
 */
router.get("/", async (req, res) => {
  try {
    const mitras = await req.dbPelanggan.query(
      "SELECT * FROM list_mitra ORDER BY nama_mitra ASC"
    );
    res.status(200).json(mitras);
  } catch (err) {
    console.error("Error fetching partners:", err.message);
    res.status(500).json({ error: "Failed to fetch partners." });
  }
});

/**
 * @route POST /
 * @description Create nama mitra baru
 * @access Private (admin, super_admin)
 */
router.post("/", authorize(["admin", "super_admin"]), async (req, res) => {
  const { nama_mitra, comment_mitra } = req.body;
  if (!nama_mitra) {
    return res.status(400).json({ error: "Nama mitra is required" });
  }
  try {
    const result = await req.dbPelanggan.query(
      "INSERT INTO list_mitra (nama_mitra, comment_mitra) VALUES (?, ?)",
      [nama_mitra, comment_mitra]
    );
    const [newMitra] = await req.dbPelanggan.query(
      "SELECT * FROM list_mitra WHERE id_mitra = ?",
      [result.insertId]
    );
    res.status(201).json(newMitra);
  } catch (err) {
    console.error("Error creating partner:", err.message);
    res.status(500).json({ error: "Failed to create partner." });
  }
});

/**
 * @route PUT /:id
 * @description Update partner
 * @access Private (admin, super_admin)
 */
router.put("/:id", authorize(["admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  const { nama_mitra, comment_mitra } = req.body;
  if (!nama_mitra) {
    return res.status(400).json({ error: "Nama mitra is required" });
  }
  try {
    const result = await req.dbPelanggan.query(
      "UPDATE list_mitra SET nama_mitra = ?, comment_mitra = ? WHERE id_mitra = ?",
      [nama_mitra, comment_mitra, id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: `Partner with ID ${id} not found.` });
    }
    const [updatedMitra] = await req.dbPelanggan.query(
      "SELECT * FROM list_mitra WHERE id_mitra = ?",
      [id]
    );
    res.status(200).json(updatedMitra);
  } catch (err) {
    console.error("Error updating partner:", err.message);
    res.status(500).json({ error: "Failed to update partner." });
  }
});

/**
 * @route DELETE /:id
 * @description Delete a partner
 * @access Private (admin, super_admin)
 */
router.delete("/:id", authorize(["admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.dbPelanggan.query(
      "DELETE FROM list_mitra WHERE id_mitra = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: `Partner with ID ${id} not found.` });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting partner:", err.message);
    res.status(500).json({ error: "Failed to delete partner." });
  }
});

module.exports = router;
