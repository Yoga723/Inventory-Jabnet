/**
 * @file backend/routes/paketRoutes.js
 * @description Route untuk manage paket-paket internet jabnet
 * @route /backend/api/paket/
 * @requires express
 * @requires ../middleware/auth
 */

const express = require('express');
const { authenticateMiddleware, authorize } = require('../../middleware/auth');
const router = express.Router();

router.use(authenticateMiddleware);

/**
 * @route GET /
 * @description Get all internet packages
 * @access Private
 */
router.get('/', async (req, res) => {
    try {
        const pakets = await req.dbPelanggan.query('SELECT * FROM paket_internet ORDER BY nama_paket ASC');
        res.status(200).json(pakets);
    } catch (err) {
        console.error("Error fetching packages:", err.message);
        res.status(500).json({ error: "Failed to fetch packages." });
    }
});

/**
 * @route POST /
 * @description Create a new internet package
 * @access Private (admin, super_admin)
 */
router.post('/', authorize(['admin', 'super_admin']), async (req, res) => {
    const { nama_paket, kecepatan_paket, harga_paket, comment_paket } = req.body;
    if (!nama_paket) {
        return res.status(400).json({ error: 'Nama paket is required' });
    }
    try {
        const result = await req.dbPelanggan.query(
            'INSERT INTO paket_internet (nama_paket, kecepatan_paket, harga_paket, comment_paket) VALUES (?, ?, ?, ?)',
            [nama_paket, kecepatan_paket, harga_paket, comment_paket]
        );
        const [newPaket] = await req.dbPelanggan.query('SELECT * FROM paket_internet WHERE id_paket = ?', [result.insertId]);
        res.status(201).json(newPaket);
    } catch (err) {
        console.error("Error creating package:", err.message);
        res.status(500).json({ error: "Failed to create package." });
    }
});

/**
 * @route PUT /:id
 * @description Update an existing internet package
 * @access Private (admin, super_admin)
 */
router.put('/:id', authorize(['admin', 'super_admin']), async (req, res) => {
    const { id } = req.params;
    const { nama_paket, kecepatan_paket, harga_paket, comment_paket } = req.body;
    if (!nama_paket) {
        return res.status(400).json({ error: 'Nama paket is required' });
    }
    try {
        const result = await req.dbPelanggan.query(
            'UPDATE paket_internet SET nama_paket = ?, kecepatan_paket = ?, harga_paket = ?, comment_paket = ? WHERE id_paket = ?',
            [nama_paket, kecepatan_paket, harga_paket, comment_paket, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Package with ID ${id} not found.` });
        }
        const [updatedPaket] = await req.dbPelanggan.query('SELECT * FROM paket_internet WHERE id_paket = ?', [id]);
        res.status(200).json(updatedPaket);
    } catch (err) {
        console.error("Error updating package:", err.message);
        res.status(500).json({ error: "Failed to update package." });
    }
});

/**
 * @route DELETE /:id
 * @description Delete an internet package
 * @access Private (admin, super_admin)
 */
router.delete('/:id', authorize(['admin', 'super_admin']), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await req.dbPelanggan.query('DELETE FROM paket_internet WHERE id_paket = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Package with ID ${id} not found.` });
        }
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting package:", err.message);
        res.status(500).json({ error: "Failed to delete package." });
    }
});

module.exports = router;
