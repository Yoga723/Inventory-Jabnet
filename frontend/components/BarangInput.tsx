import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { item_list_props } from "../types";

interface itemInputProps {
  items: item_list_props[];
  setItems: (items: item_list_props[]) => void;
  itemsOptions: { item_id: number; item_name: string }[];
}

export default function BarangInput({ items, setItems, itemsOptions = [] }: itemInputProps) {
  // Tambah baris kosong
  const addItem = () => {
    setItems([...items, { item_id: undefined, item_name: "", qty: 1, price_per_item: 0 }]);
  };

  // Hapus satu baris berdasarkan index
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update satu field berdasarkan index
  const updateItem = (index: number, field: keyof item_list_props, value: string | number) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setItems(updated);
  };

  const handleBarangChange = (index: number, item_id: number) => {
    const selectedItem = itemsOptions.find((item) => item.item_id === item_id);
    if (!selectedItem) return;
    const updated = items.map((item, i) =>
      i === index ? { ...item, item_id, item_name: selectedItem.item_name } : item
    );
    setItems(updated);
  };

  return (
    <div className="space-y-4 mt-2">
      {items.map((item, index) => (
        <div key={index}>
          <h2 className="flex items-center justify-center md:px-4 text-2xl w-full text-accent ">
            <hr className="w-full" />
            <p className="w-full text-center">Item {index + 1}</p>
            <hr className="w-full" />
          </h2>
          <div className="grid grid-cols-3 md:flex gap-2">
            {/* Item Selection Dropdown */}
            <fieldset
              // htmlFor={`barang_${index}`}
              className="fieldset mb-1 col-span-3 font-medium">
              <legend className="fieldset-legend">
                Nama Item <span className="text-red-600">*</span>
              </legend>
              <select
                id={`barang_${index}`}
                value={item.item_id || ""}
                onChange={(e) => handleBarangChange(index, parseInt(e.target.value))}
                className="select select-bordered w-full"
                required>
                <option
                  value=""
                  disabled>
                  Pilih Item
                </option>
                {itemsOptions.map((option) => (
                  <option
                    key={option.item_id}
                    value={option.item_id}>
                    {option.item_name}
                  </option>
                ))}
              </select>
            </fieldset>
            {/* Quantity Input */}
            <fieldset
              // htmlFor={`qty_${index}`}
              className="fieldset mb-1 font-medium col-span-1">
              <legend className="fieldset-legend">
                Qty <span className="text-red-600">*</span>
              </legend>
              <input
                id={`qty_${index}`}
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
                className="input"
                required
              />
            </fieldset>
            {/* harga per unit input */}
            <fieldset
              // htmlFor={`price_per_item_${index}`}
              className="fieldset mb-1 font-medium col-span-1">
              <legend className="fieldset-legend">Harga/Unit</legend>
              <input
                id={`price_per_item_${index}`}
                type="number"
                min="0"
                value={item.price_per_item}
                onChange={(e) => updateItem(index, "price_per_item", Number(e.target.value))}
                className="input"
                // pattern="[0-9.,]*"
              />
            </fieldset>

            {/* input gambar */}
            <fieldset
              // htmlFor={`price_per_item_${index}`}
              className="fieldset mb-1 font-medium col-span-1">
              <legend className="fieldset-legend">Gambar</legend>
              <input
                id={`gambar_barang_${index}`}
                type="file"
                onChange={(e) => updateItem(index, "price_per_item", Number(e.target.value))}
                className="file-input p-1"
                disabled
              />
            </fieldset>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="px-2  btn btn-error btn-outline self-end md:mb-2 col-span-3">
                <XMarkIcon className="h-5 w-5 text-red font-bold" />
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={addItem}
        type="button"
        className="btn btn-success btn-soft px-4 ">
        Tambah Item
      </button>
    </div>
  );
}
