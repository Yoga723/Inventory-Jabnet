
"use client";
import React, { useEffect } from "react";
import useRecordsLogic from "../../app/hooks/useRecordsLogic";
import BarangInput from "../BarangInput";
import Loading from "../Loading";
import { useRecordsContext } from "../../context/records/RecordsContext";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { updateCurrentItemField } from "store/recordSlice";

const FormRecords = () => {
  const { payload, handleInputChange, handleItemsChange, createRecord, putRecord, recordsStatus } = useRecordsLogic(); // Jang handle request
  const { isModalOpen, closeModal, currentRecordId } = useRecordsContext(); // Jang buka/close modal
  const { full_name, role } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleSubmit = async (event: React.FormEvent) => {
    if (currentRecordId) await putRecord(event, currentRecordId);
    else if (currentRecordId == null) await createRecord(event);
  };

  return (
    <dialog
      id="record-modal"
      className={`overflow-y-scroll bg-base-300 modal modal-middle ${isModalOpen ? "modal-open" : "hidden"}`}>
      <form
        id="record-form-modal"
        onSubmit={(event: React.FormEvent) => handleSubmit(event)}
        className="flex flex-col lg:grid grid-cols-2 items-center card bg-base-100 max-sm:w-full md:min-w-3xl max-sm:h-full overflow-auto">
        {recordsStatus == "loading" && <Loading />}
        <h4 className="mb-1 mt-10 font-bold text-lg text-center col-span-2 ">
          {currentRecordId !== null ? "Update record" : "Tambah record baru"}
        </h4>

        {/* INPUT nama */}
        <div className="w-full px-4 mb-4 mt-2 space-y-2">
          <label
            htmlFor="nama"
            className="font-semibold input w-full hidden">
            Nama <span className="text-red-600">*</span>
            <input
              id="nama"
              name="nama"
              type="nama"
              readOnly
              className="px-4 "
              value={full_name || ""}
              placeholder={full_name || ""}
            />
          </label>
        </div>
        {/* INPUT status */}
        <div className="w-full px-4 mb-4 mt-2 space-y-2 gap-4">
          <label
            htmlFor="status"
            className="font-semibold select w-full">
            Status <span className="text-red-600 mr-3">*</span>
            <select
              value={payload.status}
              name="status"
              id="status"
              onChange={(e) => handleInputChange("status", e.target.value as "Masuk" | "Keluar")}
              className="border p-2 w-full">
              <option value="Masuk">Masuk</option>
              <option value="Keluar">Keluar</option>
            </select>
          </label>
        </div>

        {/* INPUT lokasi BARANG */}
        <div className="w-full px-4 mb-4 mt-2 space-y-2">
          <label
            className="floating-label"
            htmlFor="lokasi">
            <span>
              Lokasi <span className="text-red-600 mr-3">*</span>
            </span>
            <input
              id="lokasi"
              name="lokasi"
              type="text"
              value={payload.lokasi}
              onChange={(e) => handleInputChange("lokasi", e.target.value)}
              placeholder={`Lokasi (Contoh : Bumi Pak dadang)`}
              className="input input-md w-full"
            />
          </label>
        </div>

        {/* INPUT DAFTAR BARANG */}
        <div className="w-full px-4 mb-4 mt-2 space-y-2">
          <label
            htmlFor="nama_barang_0"
            className="font-semibold">
            List Barang <span className="text-red-600">*</span>
            <span className="text-gray-400">(dalam bentuk pcs/meter)</span>
            <BarangInput
              items={payload.list_barang}
              setItems={handleItemsChange}
            />
          </label>
        </div>

        {/* INPUT nilai BARANG */}
        <div className="w-full px-4 mb-4 mt-2 space-y-2">
          <label className="floating-label">
            <span>
              Total Harga Barang <span className="text-gray-400   "> Opsional</span>
            </span>
            <input
              id="nilai"
              name="nilai"
              type="number"
              value={payload.nilai}
              onChange={(e) => handleInputChange("nilai", e.target.value)}
              pattern="[0-9.,]*"
              className="input w-full"
              placeholder={`2500000`}
            />
          </label>
        </div>

        {/* INPUT Keterangan */}
        <div className="w-full px-4 mb-4 mt-2 space-y-2">
          <fieldset className="fieldset">
            <legend>Keterangan</legend>
            <textarea
              name="keterangan"
              id="keterangan"
              value={payload.keterangan ?? ""}
              rows={4}
              onChange={(e) => handleInputChange("keterangan", e.target.value)}
              className="textarea textarea-lg w-full"></textarea>
          </fieldset>
        </div>
        <div className="w-full col-span-2 flex my-6 justify-center items-center gap-6">
          <button
            type="submit"
            className="px-6 btn btn-success">
            Kirim
          </button>
          <button
            type="button"
            onClick={() => closeModal()}
            id="dismiss-record-modal"
            className="px-6 btn bg-base-300 ">
            Close
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default FormRecords;
