"use client";
import React, { useEffect } from "react";
import { formatCurrency } from "../../app/utils/priceFormat";
import FormRecords from "./FormRecords";
import Loading from "../Loading";
import useRecordsLogic from "../../app/hooks/useRecordsLogic";
import { useAppSelector } from "../../store/Hooks";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
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

  const { full_name, username, status } = useAppSelector((state) => state.user);

  useEffect(() => {
    getRecords();
  }, []);

  return (
    <>
      <FormRecords />
      <button type="button" onClick={()=> console.log(full_name)}>CEK FULL NAME</button>
      {/* Table Records */}
      <table className="table-records">
        <thead className={`table-header-group bg-base-100`}>
          <tr className={`bg-base-300 h-fit w-full`}>
            <th
              colSpan={8}
              className="bg-base-300 w-full">
              <div className="flex justify-between items-center p-4">
                <button
                  type="button"
                  onClick={() => openModal(null)}
                  className="btn btn-primary btn-soft">
                  <PlusIcon
                    width={20}
                    height={20}
                    className="ml-1.5"
                  />
                  Tambah
                </button>

                <span className="text-sm text-black">Total Items: {recordsData.length}</span>
              </div>
            </th>
          </tr>
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
                    className={`cursor-pointer bg-base-100`}>
                    <td
                      className={`${
                        index != recordsData.length - 1 && "border-y-2 border-black"
                      } td-collapse font-bold  ${record.status === "Masuk" ? "text-success" : "text-error"}`}>
                      {record.nama}
                    </td>
                    <td className={`${index != recordsData.length - 1 && "border-y-2 border-black"} td-collapse`}>
                      {" "}
                      {new Date(record.tanggal).toLocaleDateString("en-GB")}
                    </td>

                    {/* Row Nama Barang */}
                    <td
                      className={`${
                        index != recordsData.length - 1 && "border-y-2 border-black"
                      } td-collapse min-w-30 max-w-62 whitespace-normal wrap-break-word text-center`}>
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
                    <td
                      className={`${
                        index != recordsData.length - 1 && "border-y-2 border-black"
                      } td-collapse min-w-30 max-w-62 whitespace-normal wrap-break-word text-center`}>
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

                    <td
                      className={`${
                        index != recordsData.length - 1 && "border-y-2 border-black"
                      } td-collapse min-w-16  ${record.status === "Masuk" ? "text-success" : "text-error"}`}>
                      {record.status}
                    </td>
                    <td
                      className={`${
                        index != recordsData.length - 1 && "border-y-2 border-black"
                      } td-collapse min-w-52`}>
                      {record.lokasi}
                    </td>
                    <td
                      className={`${
                        index != recordsData.length - 1 && "border-y-2 border-black"
                      } td-collapse min-w-52`}>
                      {record.keterangan}
                    </td>
                    <td
                      className={`${index != recordsData.length - 1 && "border-y-2 border-black"} ${
                        record.status === "Masuk" ? "text-success" : "text-error"
                      } text-pretty break-all overflow-auto min-w-36`}>
                      {formatCurrency(Number(record.nilai), record.status)}
                    </td>
                  </tr>
                  {/* ROW untuk action button */}
                  <tr
                    className={` text-black record-action-transition ${
                      expandedIndex === index
                        ? " motion-opacity-in-0 -motion-translate-y-in-50 motion-ease-spring-smooth motion-duration-300"
                        : "hidden"
                    } bg-base-100`}>
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
                          className={`records-action text-sm flex bg-none`}>
                          <PencilIcon
                            width={16}
                            height={16}
                            className="mr-1.5 text-secondary"
                          />
                          Edit
                        </button>
                        <button
                          onClick={(e) => deleteRecord(e, record.record_id)}
                          className={`records-action text-sm flex bg-none`}>
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
