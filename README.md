## asdasdsad

INSERT INTO catatan(nama, nilai, list_barang, lokasi, status, keterangan, kategori_id) VALUES ("yoga", [
  {
    "barang_id": 123,
    "nama_barang": "Kabel Hijau",
    "qty": 5,
    "harga_per_unit": 12500.00,
    "image_paths": [
      "/uploads/item-127-0-1685600000000.jpg",
      "/uploads/item-127-0-1685600001000.jpg"
    ]
  },
  {
    "barang_id": 111,
    "nama_barang": "Splitter",
    "qty": 3,
    "harga_per_unit": 32500.00,
    "image_paths": [
      "/uploads/item-127-1-1685600002000.jpg"
    ]
  }
], "test lokasi", "Masuk", "", 1) RETURNING *;



<!--  -->

INSERT INTO kategori (nama_kategori)
SELECT 'Backbone'
WHERE NOT EXISTS (
    SELECT 1 FROM kategori WHERE nama_kategori = 'Backbone'
);

-- Step 2: Insert items if they don't exist
INSERT INTO barang (nama_barang, kategori_id)
SELECT 'Router', kategori_id
FROM kategori WHERE nama_kategori = 'Backbone'
ON CONFLICT (nama_barang) DO NOTHING;

INSERT INTO barang (nama_barang, kategori_id)
SELECT 'Kabel', kategori_id
FROM kategori WHERE nama_kategori = 'Backbone'
ON CONFLICT (nama_barang) DO NOTHING;

-- Step 3: Insert the record
INSERT INTO catatan (
    nama, 
    list_barang, 
    lokasi, 
    status, 
    keterangan, 
    kategori_id
)
SELECT 
    'yoga' AS nama,
    jsonb_build_array(
        jsonb_build_object(
            'barang_id', (SELECT barang_id FROM barang WHERE nama_barang = 'Router'),
            'nama_barang', 'Router',
            'qty', 2,
            'harga_per_unit', 125000, 
            'image_path', '[]'::jsonb
        ),
        jsonb_build_object(
            'barang_id', (SELECT barang_id FROM barang WHERE nama_barang = 'Kabel'),
            'nama_barang', 'Kabel',
            'qty', 250,
            'harga_per_unit', 2000, 
            'image_path', '[]'::jsonb
        )
    ) AS list_barang,
    'garut' AS lokasi,
    'Masuk' AS status,
    '' AS keterangan,
    (SELECT kategori_id FROM kategori WHERE nama_kategori = 'Backbone') AS kategori_id;