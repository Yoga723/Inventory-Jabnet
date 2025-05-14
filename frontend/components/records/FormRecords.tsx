"use client";
import React from "react";
import useRecordsLogic from "../../app/hooks/useRecordsLogic";
import BarangInput from "../BarangInput";
import Loading from "../Loading";
import { useRecordsContext } from "../../context/records/RecordsContext";

const FormRecords = () => {
  const { currentRecordId } = useRecordsContext();

  const { payload, handleInputChange, handleItemsChange, getRecords, createRecord, putRecord, recordsStatus } =
    useRecordsLogic();
  const { isModalOpen, closeModal } = useRecordsContext();

  const handleSubmit = async (event: React.FormEvent) => {
    if (currentRecordId) await putRecord(event, currentRecordId);
    else if (currentRecordId == null) {
      await createRecord(event);
      // onSuccess();
    } else console.log("Tidak ada ID");
  };

  console.log(currentRecordId);

  return (
    <>
      <dialog
        className={`bg-white modal ${isModalOpen ? "modal-open" : ""}`}
        onClose={() => closeModal()}>
        <h4 className="mb-1 font-bold text-lg">{currentRecordId !== null ? "Update record" : "Tambah record baru"}</h4>

        <form
          id="record-form-modal"
          onSubmit={(event: React.FormEvent) => handleSubmit(event)}
          className="mt-6 flex flex-col ">
          {recordsStatus == "loading" && <Loading />}
          {/* INPUT nama */}
          <div className="px-4 mb-4 mt-2 space-y-2">
            <label
              htmlFor="nama"
              color="default"
              className="font-semibold input w-full">
              Nama <span className="text-red-600">*</span>
              <input
                id="nama"
                name="nama"
                type="nama"
                className="px-4 "
                value={payload.nama}
                onChange={(e) => handleInputChange("nama", e.target.value)}
                placeholder="Asep, Cecep, Kasep"
              />
            </label>
          </div>
          {/* INPUT status */}
          <div className="px-4 mb-4 mt-2 space-y-2 gap-4">
            <label
              htmlFor="status"
              color="default"
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
          <div className="px-4 mb-4 mt-2 space-y-2">
            <label className="floating-label">
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
          <div className="px-4 mb-4 mt-2 space-y-2">
            <label
              htmlFor="items_0"
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
          <div className="px-4 mb-4 mt-2 space-y-2">
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
          <div className="px-4 mb-4 mt-2 space-y-2">
            <fieldset className="fieldset">
              <legend>Keterangan</legend>
              <textarea
                name="keterangan"
                id="keterangan"
                value={payload.keterangan}
                onChange={(e) => handleInputChange("keterangan", e.target.value)}
                className="textarea textarea-lg w-full"></textarea>
            </fieldset>
          </div>
          <div className="modal-footer">
            <button
              type="submit"
              className="px-6 btn btn-success">
              Kirim
            </button>
            <button
              type="button"
              onClick={() => closeModal()}
              id="dismiss-record-modal"
              className="px-6 btn btn-error text-white">
              Close
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default FormRecords;
