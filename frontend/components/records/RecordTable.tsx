"use client";
import React, { useEffect } from "react";
import { formatCurrency } from "../../app/utils/priceFormat";
import FormRecords from "./FormRecords";
import Loading from "../Loading";
import useRecordsLogic from "../../app/hooks/useRecordsLogic";
import { useAppSelector } from "../../store/Hooks";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
// import AlertModal from "../modals/AlertModal";
import { useRecordsContext } from "../../context/records/RecordsContext";

const RecordTable = () => {
  const { getRecords, deleteRecord, expandedIndex, toggleRow, populateForm } = useRecordsLogic();
  const {
    items: recordsData, // ie intina items as recordsData
    isHomeLoading,
    status: recordsStatus, // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: recordsError,
  } = useAppSelector((state) => state.records);
  const { openModal } = useRecordsContext();

  useEffect(() => {
    getRecords();
  }, []);

  return (
    <>
      <FormRecords />
      {/* Table Records */}
      <table className="table-records">
        <thead className={`table-header-group bg-base-100`}>
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
                <React.Fragment key={index}>
                  <tr
                    onClick={() => toggleRow(index)}
                    className={`cursor-pointer ${index % 2 === 0 ? `bg-base-100` : `bg-base-300`}`}>
                    <td className="td-collapse font-bold">{record.nama}</td>
                    <td className="td-collapse"> {new Date(record.tanggal).toLocaleDateString("en-GB")}</td>

                    {/* Row Nama Barang */}
                    <td className={`td-collapse min-w-30 text-center`}>
                      <ul>
                        {record.list_barang.map((item, i) => (
                          <li
                            className="my-4"
                            key={`${record.record_id}-name-${i}`}>
                            {item.nama_barang}
                          </li>
                        ))}
                      </ul>
                    </td>
                    {/* Row QTY Barang */}
                    <td className={`td-collapse min-w-30 text-center`}>
                      <ul>
                        {record.list_barang.map((item, i) => (
                          <li
                            className="my-4"
                            key={`${record.record_id}-qty-${i}`}>
                            {item.qty}
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="td-collapse min-w-16">{record.status}</td>
                    <td className="td-collapse min-w-52">{record.lokasi}</td>
                    <td className="td-collapse min-w-52">{record.keterangan}</td>
                    <td className="text-pretty break-all overflow-auto min-w-36">
                      {formatCurrency(Number(record.nilai), record.status)}
                    </td>
                  </tr>
                  {/* ROW untuk action button */}
                  <tr
                    className={` text-black record-action-transition ${
                      expandedIndex === index
                        ? " motion-opacity-in-0 -motion-translate-y-in-50 motion-ease-spring-smooth motion-duration-300"
                        : "hidden"
                    } ${index % 2 === 0 ? "bg-base-100" : "bg-base-300"}`}>
                    <td
                      colSpan={8}
                      className="px-2">
                      <div className="flex items-center justify-start gap-8 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            populateForm(record.record_id);
                            openModal(record.record_id);
                          }}
                          className={`text-white records-action btn btn-info`}>
                          <PencilIcon
                            width={16}
                            height={16}
                            className="mr-1.5"
                          />
                          Edit
                        </button>
                        <button
                          onClick={(e) => deleteRecord(e, record.record_id)}
                          className={`text-white records-action btn btn-error`}>
                          <TrashIcon
                            width={16}
                            height={16}
                            className="mr-1.5"
                          />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
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
