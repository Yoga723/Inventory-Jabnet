import { Paket } from "types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { formatCurrency } from "app/utils/priceFormat";

interface PaketTableProps {
  pakets: Paket[];
  onEdit: (paket: Paket) => void;
  onDelete: (id: number) => void;
}

const PaketTable = ({ pakets, onEdit, onDelete }: PaketTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Nama Paket</th>
            <th>Kecepatan</th>
            <th>Harga</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {pakets.map((paket) => (
            <tr key={paket.id_paket}>
              <td>{paket.nama_paket}</td>
              <td>{paket.kecepatan_paket}</td>
              <td>{formatCurrency(paket.harga_paket)}</td>
              <td>{paket.comment_paket}</td>
              <td>
                <button onClick={() => onEdit(paket)} className="btn btn-sm btn-info mr-2">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(paket.id_paket)} className="btn btn-sm btn-error">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaketTable;