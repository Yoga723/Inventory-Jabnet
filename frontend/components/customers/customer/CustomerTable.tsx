"use client";
import React, { useState } from "react";
import { useAppSelector } from "store/Hooks";
import { Customers } from "types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

const CustomerTable = ({
  onEdit,
  onDelete,
}: {
  onEdit: (customer: Customers) => void;
  onDelete: (id: string) => void;
}) => {
  const { customers, currentPage } = useAppSelector((state) => state.customers);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const limit = 20;

  const toggleRow = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="overflow-x-auto w-full">
      <table className="table w-full overflow-x-scroll">
        <thead>
          <tr className="text-md">
            <th>No</th>
            <th>ID</th>
            <th>Nama Pelanggan</th>
            <th className="min-w-52">Alamat</th>
            <th>Email</th>
            <th>No telepon</th>
            <th>SN</th>
            <th>OLT</th>
            <th>Paket</th>
            <th>Mitra</th>
            <th>ODP</th>
            <th>Port ODP</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((item, index) => (
            <React.Fragment key={index}>
              <tr
                onClick={() => toggleRow(index)}
                className={`text-xs cursor-pointer hover:bg-base-300 ${item.mitra?.nama_mitra.length >= 3 && "text-accent"}`}>
                <td>{(currentPage - 1) * limit + index + 1}</td>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td className="min-w-52">{item.address}</td>
                <td>{item.email}</td>
                <td>{item.no_telepon}</td>
                <td>{item.sn}</td>
                <td>{item.olt}</td>
                <td className="min-w-28">
                  {item.paket?.nama_paket} {item.paket?.kecepatan_paket}
                </td>
                <td className="min-w-28">{item.mitra?.nama_mitra}</td>
                <td>{item.odp}</td>
                <td>{item.port_odp}</td>
              </tr>
              <tr className={`record-action-transition ${expandedIndex === index ? "open" : "hidden"}`}>
                <td
                  colSpan={8}
                  className="px-2 py-0">
                  <div className="flex items-center justify-start gap-8 p-2 bg-base-200">
                    {/* <button className="flex items-center text-sm">
                      <InformationCircleIcon
                        width={16}
                        height={16}
                        className="mr-1.5 text-info"
                      />
                      Details
                    </button> */}
                    <button
                      onClick={() => onEdit(item)}
                      className="flex items-center text-sm">
                      <PencilIcon
                        width={16}
                        height={16}
                        className="mr-1.5 text-warning"
                      />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="flex items-center text-sm">
                      <TrashIcon
                        width={16}
                        height={16}
                        className="mr-1.5 text-error"
                      />
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {customers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada pelanggan yang terdaftar</p>
        </div>
      )}
    </section>
  );
};

export default CustomerTable;
