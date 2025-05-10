"use client";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "../../app/utils/priceFormat";
import FormRecords from "../modals/FormRecords";
import Loading from "../Loading";
import useRecordsLogic from "../../app/hooks/useRecordsLogic";
import { useAppSelector } from "../../store/Hooks";

const RecordTable = () => {
  const [filter, setFilter] = useState("All");
  const { getRecords, deleteRecord } = useRecordsLogic();
  const {
    items: recordsData, // ie intina items as recordsData
    currentItem,
    isHomeLoading,
    status: recordsStatus, // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: recordsError,
  } = useAppSelector((state) => state.records);

  useEffect(() => {
    getRecords();
  }, []);

  const [windowY, setWindowY] = useState(0);
  useEffect(() => {
    const logY = () => setWindowY(window.scrollY);
    document.addEventListener("scroll", logY);
    return () => window.removeEventListener("scroll", logY);
  }, []);
  return (
    <>
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
        <tbody className="min-w-full gap-4 relative">
          {!isHomeLoading ? (
            <>
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
                  <td className="md:flex flex-col space-y-6 p-4 border-2">
                    <FormRecords
                      method="PUT"
                      record_id={record.record_id}
                    />
                    <button
                      type="button"
                      onClick={(event) => deleteRecord(event, record.record_id)}
                      className="jabnet-btn-template from-[#C72121] to-[#F44646] shadow-[0px_2px_10px_0px_#C72121] hover:shadow-[0px_2px_20px_0px_#F44646]">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </>
          ) : (
            <tr>
              <td
                colSpan={9}
                className="text-center py-4 h-32">
                <Loading />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default RecordTable;
