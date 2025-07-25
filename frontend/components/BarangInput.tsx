import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { item_list_props } from "../types";

interface itemInputProps {
  items: item_list_props[];
  setItems: (items: item_list_props[]) => void;
  itemsOptions: { item_id: number; item_name: string }[];
}

export default function BarangInput({ items, setItems, itemsOptions = [] }: itemInputProps) {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const searchInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle clicks outside of the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openDropdownIndex !== null &&
        dropdownRefs.current[openDropdownIndex] &&
        !dropdownRefs.current[openDropdownIndex]!.contains(event.target as Node)
      ) {
        setOpenDropdownIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownIndex]);

  // Focus the search input when a dropdown is opened
  useEffect(() => {
    if (openDropdownIndex !== null) {
      const timer = setTimeout(() => {
        searchInputRefs.current[openDropdownIndex]?.focus();
      }, 100); // A small delay to ensure the element is visible
      return () => clearTimeout(timer);
    }
  }, [openDropdownIndex]);

  const addItem = () => {
    setItems([...items, { item_id: undefined, item_name: "", qty: 1, price_per_item: 0, gambar_path: null }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setSearchTerms(searchTerms.filter((_, i) => i !== index));
    const newPreviews = { ...imagePreviews };
    delete newPreviews[index];
    setImagePreviews(newPreviews);
  };

  const updateItem = (index: number, field: keyof item_list_props, value: string | number | File) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setItems(updated);
  };

  const handleSearchChange = (index: number, value: string) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);
  };

  const handleSelectBarang = (index: number, selectedItem: { item_id: number; item_name: string }) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, item_id: selectedItem.item_id, item_name: selectedItem.item_name } : item
    );
    setItems(updatedItems);

    // Clear the search term for that dropdown after selection
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = "";
    setSearchTerms(newSearchTerms);

    setOpenDropdownIndex(null); // Close dropdown
  };

  const toggleDropdown = (index: number) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 mt-2">
      {items.map((item, index) => {
        const filteredOptions = itemsOptions.filter((option) =>
          option.item_name.toLowerCase().includes((searchTerms[index] || "").toLowerCase())
        );

        return (
          <div key={index}>
            <h2 className="flex items-center justify-center md:px-4 text-2xl w-full text-accent ">
              <hr className="w-full" />
              <p className="w-full text-center">Item {index + 1}</p>
              <hr className="w-full" />
            </h2>
            <div className="grid grid-cols-3 md:flex gap-2">
              <fieldset className="fieldset mb-1 col-span-3 font-medium">
                <legend className="fieldset-legend">
                  Nama Item <span className="text-red-600">*</span>
                </legend>
                <div
                  className={`dropdown w-full ${openDropdownIndex === index ? "dropdown-open" : ""}`}
                  ref={(el) => {
                    dropdownRefs.current[index] = el;
                  }}
                >
                  {/* Button to toggle the dropdown */}
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => toggleDropdown(index)}
                    className="input input-bordered w-full flex items-center justify-between pr-2"
                  >
                    <span className="truncate">{item.item_name || "Pilih Item"}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Dropdown content */}
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full mt-2"
                  >
                    {/* Search input as the first item */}
                    <li className="p-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        ref={(el) => {
                          searchInputRefs.current[index] = el;
                        }}
                        placeholder="Cari item..."
                        value={searchTerms[index] || ""}
                        onChange={(e) => handleSearchChange(index, e.target.value)}
                        className="input input-bordered input-sm w-full"
                      />
                    </li>
                    {/* Scrollable list of options */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                          <li key={option.item_id}>
                            <a onClick={() => handleSelectBarang(index, option)}>{option.item_name}</a>
                          </li>
                        ))
                      ) : (
                        <li className="text-center p-2">
                          <a>Item tidak ditemukan</a>
                        </li>
                      )}
                    </div>
                  </ul>
                </div>
              </fieldset>

              {/* Other fields (Qty, Harga/Unit, Gambar) remain unchanged */}
              <fieldset className="fieldset mb-1 font-medium col-span-1">
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

              <fieldset className="fieldset mb-1 font-medium col-span-1">
                <legend className="fieldset-legend">Harga/Unit</legend>
                <input
                  id={`price_per_item_${index}`}
                  type="number"
                  min="0"
                  value={item.price_per_item || 0}
                  onChange={(e) => updateItem(index, "price_per_item", Number(e.target.value))}
                  className="input"
                />
              </fieldset>

              <fieldset className="fieldset mb-1 font-medium col-span-1">
                <legend className="fieldset-legend">Gambar</legend>
                <input
                  id={`gambar_path_${index}`}
                  name="gambar_path"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      updateItem(index, "gambar_path", file);
                      setImagePreviews((prev) => ({ ...prev, [index]: URL.createObjectURL(file) }));
                    }
                  }}
                  className="file-input p-1"
                />
                {imagePreviews[index] && (
                  <img src={imagePreviews[index]} alt="Preview" className="mt-2 h-16 w-16 object-cover" />
                )}
                {!imagePreviews[index] && typeof item.gambar_path === "string" && item.gambar_path && (
                  <img
                    src={`/uploads/${item.gambar_path}`}
                    alt="Gambar Item"
                    className="mt-2 h-16 w-16 object-cover"
                  />
                )}
              </fieldset>

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-2 btn btn-error btn-outline self-end md:mb-2 col-span-3"
                >
                  <XMarkIcon className="h-5 w-5 text-red font-bold" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      <button onClick={addItem} type="button" className="btn btn-success btn-soft px-4 ">
        Tambah Item
      </button>
    </div>
  );
}
