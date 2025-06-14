import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Item, Kategori } from "types";

interface ProductsTableProps {
  items: Item[];
  categories: Kategori[];
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ items, categories, onEdit, onDelete }) => {
  const getCategoryName = (kategori_id: number) => {
    const category = categories.find((cat) => cat.kategori_id === kategori_id);
    return category ? category.nama_kategori : "Unknown";
  };

  return (
    <>
      <table className="table w-full overflow-x-auto">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Barang</th>
            <th>Kategori</th>
            <th>Dibuat Pada</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.item_id}>
              <td>{item.item_id}</td>
              <td>{item.item_name}</td>
              <td>{getCategoryName(item.kategori_id)}</td>
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
              <td>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="btn btn-sm btn-warning">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.item_id)}
                    className="btn btn-sm btn-error">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada barang yang terdaftar</p>
        </div>
      )}
    </>
  );
};

export default ProductsTable;
