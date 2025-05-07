import React from "react";
import { Input, Button, IconButton } from "@material-tailwind/react";
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
          <Input
            id="items"
            name={`nama_barang_${index}`}
            value={item.nama_barang}
            onChange={(e) => updateItem(index, "nama_barang", e.target.value)}
            placeholder="Nama Barang"
            className=" px-2"
          />
          <Input
            name={`qty_${index}`}
            type="number"
            value={item.qty}
            onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
            placeholder="Qty"
            className="w-24 px-2"
          />
          {items.length > 1 && (
            <IconButton
              size="sm"
              onClick={() => removeItem(index)}>
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </IconButton>
          )}
        </div>
      ))}

      <Button
        size="sm"
        variant="outline"
        onClick={addItem}
        type="button"
        className="mt-2 py-2 bg-gradient-to-r from-[#D55226] to-[#F47146] hover:bg-gradient-to-l border-none text-white leading-relaxed cursor-pointer shadow-[0px_2px_10px_0px_#F47146] hover:shadow-[0px_2px_20px_0px_#F47146]">
        Tambah Barang
      </Button>
    </div>
  );
}
