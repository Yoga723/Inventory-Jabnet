import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { list_barang_props } from "../types";

export default function BarangInput({
  items,
  setItems,
}: {
  items: list_barang_props[];
  setItems: (items: list_barang_props[]) => void;
}) {
  // Tambah baris kosong
  const addItem = () => {
    setItems([...items, { nama_barang: "", qty: 1 }]);
  };

  // Hapus satu baris berdasarkan index
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update satu field berdasarkan index
  const updateItem = (index: number, field: keyof list_barang_props, value: string | number) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setItems(updated);
  };

  return (
    <div className="space-y-4 mt-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2">
          <label
            htmlFor={`nama_barang_${index}`}
            className="floating-label">
            <input
              id={`nama_barang_${index}`}
              name={`nama_barang_${index}`}
              value={item.nama_barang}
              onChange={(e) => updateItem(index, "nama_barang", e.target.value)}
              placeholder="Nama Barang"
              className="input"
            />
          </label>
          <label
            htmlFor={`qty_${index}`}
            className="floating-label">
            <input
              id={`qty_${index}`}
              name={`qty_${index}`}
              type="number"
              value={item.qty}
              onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
              placeholder="Qty"
              className="w-24 px-2 input"
            />
          </label>
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="px-2 btn btn-error btn-outline">
              <XMarkIcon className="h-5 w-5 text-red font-bold" />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addItem}
        type="button"
        className="btn btn-success btn-soft px-4 ">
        Tambah Barang
      </button>
    </div>
  );
}
