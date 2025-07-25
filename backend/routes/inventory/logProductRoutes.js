// routes/logProductRoutes.js
const router = require("express").Router();
const excelJS = require("exceljs");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { authenticateMiddleware, authorize } = require("../../middleware/auth");
const { json } = require("body-parser");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, "../../../frontend/public/uploads");
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const resizeImage = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(
    req.files.map(async (file) => {
      try {
        const filePath = file.path;
        const tempPath = path.join(path.dirname(filePath), `temp-${file.filename}`);
        
        await sharp(filePath)
          .resize(800, 800, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(tempPath);

        await fs.promises.rename(tempPath, filePath);
      } catch (err) {
        console.error("Error resizing image:", err);
      }
    })
  );
  next();
};

router.use(authenticateMiddleware);

router.use((req, res, next) => {
  // Set current user ID for trigger
  if (req.user) {
    req.db.query(`SET app.current_user_id = ${req.user.user_id}`);
  }
  next();
});

const calculateTotalNilai = (item_list) => {
  if (!Array.isArray(item_list)) return 0;

  return item_list.reduce((total, item) => {
    const qty = parseFloat(item.qty) || 0;
    const harga = parseFloat(item.price_per_item) || 0;
    return total + qty * harga;
  }, 0);
};


// ===============================================================
// ROUTES UNTUK RECORDS/LOG PRODUCTS
// ===============================================================

router.get("/export", async (req, res) => {
  try {
    // 1) GET QUERY PARAMS
    const { search, status, start_date, end_date } = req.query;
    let baseQuery = `
      SELECT 
        c.*,
        k.nama_kategori AS kategori
      FROM catatan c
      JOIN kategori k ON c.kategori_id = k.kategori_id
    `;
    const conditions = [];
    const values = [];

    // 2) CONDITIONING FILTER
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (c.nama ILIKE $${values.length} OR 
        c.item_list::text ILIKE $${values.length} OR 
        c.lokasi ILIKE $${values.length})
      `);
    }

    if (status) {
      values.push(status);
      conditions.push(`c.status = $${values.length}`);
    }

    if (start_date && end_date) {
      values.push(start_date, end_date);
      conditions.push(`
        c.tanggal BETWEEN $${values.length - 1}::timestamp 
        AND $${values.length}::timestamp
      `);
    }

    if (conditions.length) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    baseQuery += " ORDER BY c.tanggal DESC";

    // 3) GET DATA
    const result = await req.db.query(baseQuery, values);
    const records = result.rows;

    // 4) Setup workbook & worksheet
    const workbook = new excelJS.Workbook();
    const workSheet = workbook.addWorksheet("Catatan Inventory Jabnet");

    workSheet.columns = [
      {
        header: "Nama",
        key: "nama",
        width: 15,
        style: {
          alignment: {
            wrapText: true,
            horizontal: "center",
            vertical: "middle",
          },
        },
      },
      {
        header: "Tanggal",
        key: "tanggal",
        width: 15,
        style: {
          alignment: {
            wrapText: true,
            horizontal: "center",
            vertical: "middle",
          },
        },
      },
      {
        header: "Lokasi",
        key: "lokasi",
        width: 30,
        style: {
          alignment: {
            wrapText: true,
            horizontal: "center",
            vertical: "middle",
          },
        },
      },
      {
        header: "List Barang (pcs/meter)",
        key: "item_list",
        width: 30,
        style: {
          alignment: {
            wrapText: true,
            vertical: "top",
            alignment: { horizontal: "center", vertical: "middle" },
          },
        },
      },
      {
        header: "Perkiraan Harga (IDR)",
        key: "nilai",
        width: 15,
        style: {
          numFmt: '"Rp"#,##0;[Red]-"Rp"#,##0',
          alignment: {
            wrapText: true,
            horizontal: "center",
            vertical: "middle",
          },
        },
      },
      {
        header: "Keterangan",
        key: "keterangan",
        width: 30,
        style: {
          alignment: {
            wrapText: true,
            horizontal: "center",
            vertical: "middle",
          },
        },
      },
      {
        header: "Status",
        key: "status",
        width: 10,
        style: {
          alignment: {
            wrapText: true,
            horizontal: "center",
            vertical: "middle",
          },
        },
      },
    ];

    records.forEach((record) => {
      const listText = (record.item_list || [])
        .map(
          (item) =>
            `${item.item_name} (${
              item.qty
            }) @Rp${item.price_per_item?.toLocaleString("id-ID")}`
        )
        .join("\n");

      // Calculate total nilai
      const totalNilai = calculateTotalNilai(record.item_list);

      workSheet.addRow({
        nama: record.nama,
        tanggal: record.tanggal,
        lokasi: record.lokasi,
        item_list: listText,
        nilai: totalNilai,
        keterangan: record.keterangan,
        status: record.status,
        kategori: record.kategori,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Catatan Inventory Jabnet.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ status: 500, error: "Gagal Export Data" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, status, kategori_id, start_date, end_date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let countQuery = `SELECT COUNT(*) FROM catatan c JOIN kategori k ON c.kategori_id = k.kategori_id`;
    let baseQuery = `
      SELECT 
        c.record_id,
        c.nama,
        c.tanggal,
        c.lokasi,
        c.item_list,
        c.keterangan,
        c.status,
        k.nama_kategori AS kategori,
        c.kategori_id
      FROM catatan c
      JOIN kategori k ON c.kategori_id = k.kategori_id
    `;
    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (c.nama ILIKE $${values.length} OR 
        c.item_list::text ILIKE $${values.length} OR 
        c.lokasi ILIKE $${values.length})
      `);
    }

    if (status) {
      values.push(status);
      conditions.push(`c.status = $${values.length}`);
    }

    if (kategori_id) {
      values.push(kategori_id);
      conditions.push(`c.kategori_id = $${values.length}`);
    }

    if (start_date && end_date) {
      values.push(start_date, end_date);
      conditions.push(`
        c.tanggal BETWEEN $${values.length - 1}::timestamp 
        AND $${values.length}::timestamp
      `);
    }

    if (conditions.length) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      baseQuery += whereClause;
      countQuery += whereClause;
    }

    // Get total count
    const totalResult = await req.db.query(countQuery, values);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Add pagination to the main query
    baseQuery += " ORDER BY c.tanggal DESC LIMIT $" + (values.length + 1) + " OFFSET $" + (values.length + 2);
    values.push(limit, offset);

    const result = await req.db.query(baseQuery, values);
    // Calculate nilai for each record
    const recordsWithNilai = result.rows.map((record) => ({
      ...record,
      nilai: calculateTotalNilai(record.item_list),
    }));

    res.json({
      data: recordsWithNilai,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: total,
      },
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Failed to retrieve catatan" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const paramId = req.params.id;
    if (isNaN(paramId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const query = `
      SELECT 
        c.*,
        k.nama_kategori AS kategori
      FROM catatan c
      JOIN kategori k ON c.kategori_id = k.kategori_id
      WHERE record_id = $1
    `;

    const result = await req.db.query(query, [paramId]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Record not found" });

    const record = result.rows[0];
    // Hitung total nilai for the record
    const recordWithNilai = {
      ...record,
      nilai: calculateTotalNilai(record.item_list),
    };

    res.json({ status: "success", data: recordWithNilai });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Failed to retrieve catatan" });
  }
});

router.get("/:id/history", async (req, res) => {
  try {
    const recordId = req.params.id;
    if (isNaN(recordId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const query = `
      SELECT 
        h.history_id,
        h.action,
        h.changed_at,
        u.username AS changed_by,
        h.changes
      FROM catatan_history h
      JOIN users u ON h.user_id = u.user_id
      WHERE h.record_id = $1
      ORDER BY h.changed_at DESC
    `;

    const result = await req.db.query(query, [recordId]);

    res.json({ status: "success", data: result.rows });
  } catch (error) {
    console.error("History query error:", error);
    res.status(500).json({ error: "Failed to retrieve history" });
  }
});

router.post(
  "/",
  authorize(["field", "operator", "admin", "super_admin"]),
  upload.any(),
  resizeImage,
  async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
      }

      const { nama, item_list, lokasi, status, keterangan, kategori_id } = req.body;
      let items = JSON.parse(item_list);

      if (req.files && req.files.length > 0) {
        const fileMap = {};
        req.files.forEach((file) => {
          const match = file.fieldname.match(/gambar_path_(\d+)/);
          if (match) {
            const index = parseInt(match[1], 10);
            fileMap[index] = `/uploads/${file.filename}`;
          }
        });

        items.forEach((item, index) => {
          if (fileMap[index]) {
            item.gambar_path = fileMap[index];
          }
        });
      }

      if (!nama || !status || !lokasi || !kategori_id) {
        return res.status(400).json({ error: "Nama, status, lokasi, dan kategori_id diperlukan" });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "item_list harus berisi array tidak kosong" });
      }

      const query = `
        INSERT INTO catatan(nama, item_list, lokasi, status, keterangan, kategori_id) 
        VALUES ($1, $2::JSONB, $3, $4, $5, $6) 
        RETURNING *
      `;

      const values = [nama, JSON.stringify(items), lokasi, status, keterangan || null, kategori_id];
      const result = await req.db.query(query, values);
      const record = result.rows[0];
      record.nilai = calculateTotalNilai(record.item_list);

      res.status(200).json({
        status: 200,
        message: "Data berhasil ditambahkan",
        data: record,
      });
    } catch (error) {
      console.error("Database insert error:", error);
      res.status(500).json({ error: `Failed to create record: ${error.message}` });
    }
  }
);

router.put(
  "/:id",
  authorize(["field", "operator", "admin", "super_admin"]),
  upload.any(),
  resizeImage,
  async (req, res) => {
    try {
      const paramId = req.params.id;
      if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });

      const { nama, item_list, lokasi, status, keterangan, kategori_id } = req.body;
      let items = JSON.parse(item_list);

      if (req.files && req.files.length > 0) {
        const fileMap = {};
        req.files.forEach((file) => {
          const match = file.fieldname.match(/gambar_path_(\d+)/);
          if (match) {
            const index = parseInt(match[1], 10);
            fileMap[index] = `/uploads/${file.filename}`;
          }
        });

        items.forEach((item, index) => {
          if (fileMap[index]) {
            item.gambar_path = fileMap[index];
          }
        });
      }

      if (!nama || !status || !lokasi || !kategori_id) {
        return res.status(400).json({ error: "Nama, status, lokasi, and kategori_id are required" });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "item_list must be a non-empty array" });
      }

      await req.db.query("BEGIN");

      const query = `
        UPDATE catatan 
        SET nama = $1, item_list = $2::JSONB, lokasi = $3, status = $4, keterangan = $5, kategori_id = $6
        WHERE record_id = $7 
        RETURNING *
      `;

      const values = [nama, JSON.stringify(items), lokasi, status, keterangan || null, kategori_id, paramId];
      const result = await req.db.query(query, values);
      await req.db.query("COMMIT");

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      const record = result.rows[0];
      const recordWithNilai = { ...record, nilai: calculateTotalNilai(record.item_list) };

      res.status(200).json({
        status: 200,
        message: "Berhasil Update data",
        data: recordWithNilai,
      });
    } catch (error) {
      await req.db.query("ROLLBACK");
      console.error("Database error:", error);
      res.status(500).json({ error: "Terjadi kesalahan server" });
    }
  }
);

router.delete(
  `/:id`,
  authorize(["field", "operator", "admin", "super_admin"]),
  async (req, res) => {
    try {
      const paramId = parseInt(req.params.id);
      if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });

      // Get the record before deleting to find associated images
      const selectQuery = "SELECT item_list FROM catatan WHERE record_id = $1";
      const selectResult = await req.db.query(selectQuery, [paramId]);

      if (selectResult.rows.length > 0) {
        const { item_list } = selectResult.rows[0];
        if (item_list && Array.isArray(item_list)) {
          item_list.forEach((item) => {
            if (item.gambar_path) {
              const imagePath = path.join(__dirname, "../../../frontend/public", item.gambar_path);
              fs.unlink(imagePath, (err) => {
                if (err) {
                  // Log the error but don't block the deletion process
                  console.error(`Failed to delete image: ${imagePath}`, err);
                }
              });
            }
          });
        }
      }

      const deleteQuery = `DELETE FROM catatan WHERE record_id = $1 RETURNING *`;
      const result = await req.db.query(deleteQuery, [paramId]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Berhasil Hapus Data !!",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Database delete error:", error);
      res.status(500).json({ error: `Failed to delete record, ${error}` });
    }
  }
);

module.exports = router;
