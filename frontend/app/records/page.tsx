"use client";
import React, { Suspense, useEffect, useState } from "react";
import Header from "../../components/Header";
import useRecordsLogic from "../hooks/useRecordsLogic";
import { recordsProp } from "../../types";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FormRecords from "../../components/modals/FormRecords";
import Loading from "../../components/Loading";
import { formatCurrency } from "../utils/priceFormat";
import Image from "next/image";
import { dummyData } from "../../public/dummy";

const page = () => {
  const [recordsData, setRecordsData] = useState<recordsProp[]>(dummyData);
  const [filter, setFilter] = useState("All");
  const { getRecords } = useRecordsLogic();

  useEffect(() => {
    (async () => {
      const response = await getRecords();
      setRecordsData(response.data);
    })();
  }, []);

  const [windowY, setWindowY] = useState(0);
  useEffect(() => {
    const logY = () => setWindowY(window.scrollY);
    document.addEventListener("scroll", logY);
    return () => window.removeEventListener("scroll", logY);
  }, []);

  return (
    <>
      <Header />
      <main className="overflow-x-auto min-h-screen max-h-[1280px] antialiased md:px-12 mt-20">
        {/* Table Function */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex gap-5 mt-5 justify-center items-center">
            {/* Search Input */}
            <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 w-full sm:w-64">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search pake nama atau barang"
                className="w-full focus:outline-none text-sm"
              />
            </div>
            {/* Filter Dropdown */}
            <div className="relative inline-block text-left">
              <button
                className="inline-flex justify-center items-center w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md cursor-pointer"
                id="filter-menu"
                aria-haspopup="true"
                aria-expanded="true">
                <Image
                  width={15}
                  height={15}
                  src="https://img.icons8.com/ios/100/filter--v1.png"
                  alt="filter--v1"
                />
                <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-500" />
              </button>
              {/* Dropdown items */}
              <div
                className="origin-top-left absolute left-0 mt-1 w-40 hidden rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[3]"
                role="menu"
                id="dropdown-filter"
                aria-orientation="vertical"
                aria-labelledby="filter-menu">
                <div className="py-1">
                  {["All", "Withdraw", "Deposit"].map((opt) => (
                    <button
                      key={opt}
                      // onClick={() => setFilter(opt)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      role="menuitem">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Tambah Button */}
            <FormRecords method={"POST"} />
          </div>
        </div>
        {/* Table Records */}
        <table className="table-records">
          <thead className={` ${windowY > 150 && "sticky top-0"} table-header-group bg-white border-2 border-black`}>
            <tr>
              <th rowSpan={2}>Nama</th>
              <th rowSpan={2}>Tanggal</th>

              <th
                colSpan={2}
                rowSpan={1}>
                Barang
              </th>

              <th rowSpan={2}>Status</th>
              <th rowSpan={2}>Lokasi</th>
              <th rowSpan={2}>Keterangan</th>
              <th rowSpan={2}>Perkiraan Harga</th>
              <th rowSpan={2}>Action</th>
            </tr>
            <tr className="table-row">
              <th>Nama Barang</th>
              <th>Qty (Satuan/Meter)</th>
            </tr>
          </thead>
          <Suspense fallback={<Loading />}>
            <tbody className="min-w-full gap-4">
              {recordsData.map((record, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-[#EBEBEB]">
                  <td>{record.nama}</td>
                  <td> {new Date(record.tanggal).toLocaleDateString("en-GB")}</td>

                  {/* Row Nama Barang */}
                  <td className="min-w-20 text-center">
                    {record.list_barang.map((item, index) => (
                      <ul key={index}>
                        <li className="my-4">{item.nama_barang}</li>
                      </ul>
                    ))}
                  </td>
                  {/* Row QTY Barang */}
                  <td className="min-w-20 text-center">
                    {record.list_barang.map((item, index) => (
                      <ul key={index}>
                        <li className="my-4">{item.qty}</li>
                      </ul>
                    ))}
                  </td>

                  <td>{record.status}</td>
                  <td>{record.lokasi}</td>
                  <td>{record.keterangan}</td>
                  <td className="text-pretty break-all overflow-auto">
                    {formatCurrency(Number(record.nilai), record.status)}
                  </td>
                  <td className="space-y-6 p-2">
                    <FormRecords
                      method="UPDATE"
                      record_id={record.record_id}
                    />
                    <button
                      type="button"
                      className="jabnet-btn-template from-[#C72121] to-[#F44646] shadow-[0px_2px_10px_0px_#C72121] hover:shadow-[0px_2px_20px_0px_#F44646]">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Suspense>
        </table>
      </main>
    </>
  );
};

export default page;
