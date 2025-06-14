import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Kategori } from "types";

interface ProductsFormProps {
  isOpen: boolean;
  item: any;
  categories: Kategori[];
  formData: { item_id?: number; item_name: string; kategori_id: number };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ProductsForm: React.FC<ProductsFormProps> = ({
  isOpen,
  item,
  categories,
  formData,
  onClose,
  onSubmit,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {formData.item_id ? "Edit Barang" : "Tambah Barang Baru"}
            <span>{formData.item_id && formData.item_id}</span>
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Nama Barang</span>
            </label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={onChange}
              placeholder="Contoh: Router F660L"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Kategori</span>
            </label>
            <select
              name="kategori_id"
              value={formData.kategori_id}
              onChange={onChange}
              className="select select-bordered w-full">
              {categories.map((category) => (
                <option
                  key={category.kategori_id}
                  value={category.kategori_id}>
                  {category.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary">
              {formData.item_id ? "Update Barang" : "Tambah Barang"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsForm;
