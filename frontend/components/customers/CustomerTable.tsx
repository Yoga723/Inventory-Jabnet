"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/Hooks";

const CustomerTable = () => {
  const dispatch = useAppDispatch();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { currentPage, customers, status, hasMore, error } = useAppSelector((state) => state.customers);

  useEffect(() => {
    console.log(customers);
  }, [customers]);

  const toggleRow = (idx: number) => {
    setExpandedIndex((expandedIndex) => (expandedIndex == idx ? null : idx));
  };

  return (
    <section className="overflow-x-auto w-full pb-10">
      <table className="table w-full ">
        <thead>
          <tr className="text-md">
            <th>ID</th>
            <th>Nama Pelanggan</th>
            <th>alamat</th>
            <th>No telepon</th>
            <th>SN</th>
            <th>OLT</th>
            <th>ODP</th>
            <th>Port ODP</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((item, index) => (
            <>
              <tr
                key={item.id}
                onClick={() => toggleRow(index)}
                className="text-xs">
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.address}</td>
                <td>{item.no_telepon}</td>
                <td>{item.sn}</td>
                <td>{item.olt}</td>
                <td>{item.odp}</td>
                <td>{item.port_odp}</td>
              </tr>
              <tr
                key={index}
                className={`record-action-transition ${
                  expandedIndex === index
                    ? " motion-opacity-in-0 -motion-translate-y-in-50 motion-ease-spring-smooth motion-duration-300"
                    : "hidden"
                }`}>
                <td
                  colSpan={10}
                  className="px-2">
                  <div className="flex items-center justify-start gap-8 p-1">
                    <button>EDIT</button>
                  </div>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>

      {/* {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada barang yang terdaftar</p>
        </div>
      )} */}
    </section>
  );
};

export default CustomerTable;
