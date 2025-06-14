import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Kategori } from "types";

interface ProductsFormProps {
  isOpen: boolean;
  formType: 'item' | 'category';
  item: any;
  categories: Kategori[];
  formData: { item_id?: number; item_name?: string; kategori_id?: number; nama_kategori?: string };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ProductsForm: React.FC<ProductsFormProps> = ({
  isOpen,
  formType,
  item,
  categories,
  formData,
  onClose,
  onSubmit,
  onChange,
}) => {
  if (!isOpen) return null;

  const isEditing = formType === 'item' ? formData.item_id : formData.kategori_id;
  const title = formType === 'item'
    ? (isEditing ? "Edit Barang" : "Tambah Barang Baru")
    : (isEditing ? "Edit Kategori" : "Tambah Kategori Baru");

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {formType === 'item' ? (
            <>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Nama Barang</span>
                </label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name || ''}
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
                  value={formData.kategori_id || ''}
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
            </>
          ) : (
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Nama Kategori</span>
              </label>
              <input
                type="text"
                name="nama_kategori"
                value={formData.nama_kategori || ''}
                onChange={onChange}
                placeholder="Contoh: Backbone"
                className="input input-bordered w-full"
                required
              />
            </div>
          )}

          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary">
              {isEditing ? "Update" : "Tambah"}
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