import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Kategori } from "types";

interface CategoryTableProps {
  categories: Kategori[];
  onEdit: (category: Kategori) => void;
  onDelete: (id: number) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ categories, onEdit, onDelete }) => {
  const getCategoryName = (kategori_id: number) => {
    const category = categories.find((cat) => cat.kategori_id === kategori_id);
    return category ? category.nama_kategori : "Unknown";
  };

  return (
    <>
      <table className="table w-full overflow-x-auto mb-10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Kategori</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.kategori_id}>
              <td>{item.kategori_id}</td>
              <td>{item.nama_kategori}</td>
              <td>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="btn btn-sm btn-warning">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.kategori_id)}
                    className="btn btn-sm btn-error">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {categories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada barang yang terdaftar</p>
        </div>
      )}
    </>
  );
};

export default CategoryTable;
