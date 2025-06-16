// routes/recordRoutes.js
const router = require("express").Router();
const excelJS = require("exceljs");
const multer = require("multer");
const upload = multer();
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { authenticateMiddleware, authorize } = require("../middleware/auth");
const { json } = require("body-parser");

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

// Helper function to process items and images
const processItems = async (items, recordId) => {
  const processedItems = [];

  for (const item of items) {
    const processedItem = {
      item_id: item.item_id,
      item_name: item.item_name,
      qty: item.qty || 1,
      price_per_item: item.price_per_item || 0,
      image_path: [],
    };

    // Process images if they exist
    if (item.images && item.images.length > 0) {
      for (let i = 0; i < item.images.length; i++) {
        const image = item.images[i];
        if (!image.buffer) continue;

        try {
          // Compress and resize image
          const compressedImage = await sharp(image.buffer)
            .resize(800, 800, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 70, progressive: true })
            .toBuffer();

          // Generate unique filename
          const filename = `item-${recordId}-${
            item.item_id
          }-${Date.now()}-${i}.jpg`;
          const imagePath = path.join("public", "uploads", filename);

          // Save to filesystem
          await fs.promises.writeFile(imagePath, compressedImage);

          // Store relative path
          processedItem.image_path.push(`/uploads/${filename}`);
        } catch (error) {
          console.error("Image processing error:", error);
          // Continue processing other images even if one fails
        }
      }
    }

    processedItems.push(processedItem);
  }

  return processedItems;
};

router.get("/", async (req, res) => {
  try {
    const { search, status, kategori_id, start_date, end_date } = req.query;
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
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    baseQuery += " ORDER BY c.tanggal DESC";

    const result = await req.db.query(baseQuery, values);
    // Calculate nilai for each record
    const recordsWithNilai = result.rows.map((record) => ({
      ...record,
      nilai: calculateTotalNilai(record.item_list),
    }));

    console.log("This is response", recordsWithNilai.item_list);

    res.json({ status: "success", data: recordsWithNilai });
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
  async (req, res) => {
    try {
      // Handle missing request body
      if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
      }

      const { nama, item_list, lokasi, status, keterangan, kategori_id } =
        req.body;

      // Default to empty array if undefined
      const rawItemList = item_list || "[]";

      let items;
      try {
        // Parse JSON or use directly if already array
        items = Array.isArray(rawItemList)
          ? rawItemList
          : JSON.parse(rawItemList);
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid item_list format" });
      }

      // Validate required fields
      if (!nama || !status || !lokasi || !kategori_id) {
        return res.status(400).json({
          error: "Nama, status, lokasi, dan kategori_id diperlukan",
        });
      }

      // Validate items
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: "item_list harus berisi array tidak kosong",
        });
      }

      // Process images and prepare items
      const processedItems = await processItems(items, null);

      const query = `
        INSERT INTO catatan(
          nama, 
          item_list, 
          lokasi, 
          status, 
          keterangan, 
          kategori_id
        ) 
        VALUES ($1, $2::JSONB, $3, $4, $5, $6) 
        RETURNING *
      `;

      const values = [
        nama,
        JSON.stringify(processedItems),
        lokasi,
        status,
        keterangan || null,
        kategori_id,
      ];

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
      res.status(500).json({
        error: `Failed to create record: ${error.message}`,
      });
    }
  }
);

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

router.get("/kategori", async (req, res) => {
  try {
    const query =
      "SELECT kategori_id, nama_kategori FROM kategori ORDER BY nama_kategori";
    const result = await req.db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get items by category ID
router.get("/item", async (req, res) => {
  try {
    const { kategori_id } = req.query;
    if (kategori_id) {
      const query =
        "SELECT item_id, item_name FROM barang WHERE kategori_id = $1 ORDER BY item_name";
      const result = await req.db.query(query, [kategori_id]);
      res.json(result.rows);
    } else {
      // return res.status(400).json({ error: "kategori_id is required" });
      const query = `
      SELECT 
        b.item_id, 
        b.item_name, 
        b.kategori_id, 
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

router.post("/item", authorize(["admin", "super_admin"]), async (req, res) => {
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
    const categoryCheck = await req.db.query(
      "SELECT kategori_id FROM kategori WHERE kategori_id = $1",
      [kategori_id]
    );

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

router.put(
  "/item/:id",
  authorize(["admin", "super_admin"]),
  async (req, res) => {
    const paramId = parseInt(req.params.id);
    const { item_name, kategori_id } = req.body;

    try {
      // Check if category exists
      const categoryCheck = await req.db.query(
        "SELECT kategori_id FROM kategori WHERE kategori_id = $1",
        [kategori_id]
      );

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
        data: result.rows[0], // now includes item_id
      });
    } catch (error) {
      return res.json({
        message: "Gagal Update Barang!",
        code: 500,
        error: error.message,
      });
    }
  }
);

router.delete(`/item/:id`, authorize(["admin", "super_admin"]),async (req, res) => {
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

router.put(
  "/:id",
  authorize(["operator", "admin", "super_admin"]),
  upload.any(),
  async (req, res) => {
    try {
      const paramId = req.params.id;
      if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });

      const { nama, item_list, lokasi, status, keterangan, kategori_id } =
        req.body;

      // Parse item_list from JSON string
      const items = Array.isArray(item_list)
        ? item_list
        : JSON.parse(item_list || "[]");

      // Validate required fields
      if (!nama || !status || !lokasi || !kategori_id) {
        return res.status(400).json({
          error: "Nama, status, lokasi, and kategori_id are required",
        });
      }

      // Validate items
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: "item_list must be a non-empty array",
        });
      }

      // Process images and prepare items
      const processedItems = await processItems(items, paramId);

      // Use transaction
      await req.db.query("BEGIN");

      const query = `
        UPDATE catatan 
        SET 
          nama = $1, 
          item_list = $2::JSONB, 
          lokasi = $3, 
          status = $4, 
          keterangan = $5,
          kategori_id = $6
        WHERE record_id = $7 
        RETURNING *
      `;

      const values = [
        nama,
        JSON.stringify(processedItems),
        lokasi,
        status,
        keterangan || null,
        kategori_id,
        paramId,
      ];

      const result = await req.db.query(query, values);
      await req.db.query("COMMIT");

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      // Calculate total nilai for response
      const record = result.rows[0];
      const recordWithNilai = {
        ...record,
        nilai: calculateTotalNilai(record.item_list),
      };

      // // Enhanced validation
      // const numericValue = Number(nilai);
      // if (isNaN(numericValue)) {
      //   return res.status(400).json({ error: "Nilai must be a valid number" });
      // }
      // if (Math.abs(numericValue) > 9999999999.99) {
      //   return res.status(400).json({
      //     error: "Nilai cannot exceed 9,999,999,999.99",
      //   });
      // }

      // // Use transaction for safety
      // await req.db.query("BEGIN");
      // const query = `UPDATE catatan SET nama = $1, nilai = $2, item_list = $3::JSONB,
      //             lokasi = $4, status = $5, keterangan = $6
      //             WHERE record_id = $7 RETURNING *`;
      // const value = [
      //   nama,
      //   nilai,
      //   item_list,
      //   lokasi,
      //   status,
      //   keterangan || null,
      //   paramId,
      // ];

      // const result = await req.db.query(query, value);
      // await req.db.query("COMMIT");

      // if (result.rowCount === 0) {
      //   return res.status(404).json({ error: "Record not found" });
      // }

      res.status(200).json({
        status: 200,
        message: "Berhasil Update data",
        data: recordWithNilai,
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
  }
);

router.delete(
  `/:id`,
  authorize(["operator", "admin", "super_admin"]),
  async (req, res) => {
    try {
      const paramId = parseInt(req.params.id);
      if (isNaN(paramId)) return res.status(400).json({ error: "Invalid ID" });
      const query = `DELETE FROM catatan WHERE record_id = $1 RETURNING *`;

      const result = await req.db.query(query, [paramId]);
      res.status(200).json({
        status: 200,
        message: "Berhasil Hapus Data !!",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Database insert error:", error);
      res.status(500).json({ error: `Failed to delete record, ${error}` });
    }
  }
);

module.exports = router;
