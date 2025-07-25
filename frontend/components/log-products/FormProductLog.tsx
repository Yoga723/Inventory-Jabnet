"use client";
import React, { useEffect } from "react";
import BarangInput from "../BarangInput";
import Loading from "../Loading";
import { useAppSelector } from "store/Hooks";
import AlertModal from "components/modals/AlertModal";
import { XMarkIcon } from "@heroicons/react/24/solid";
import useLogProductsLogic from "app/hooks/inventory/useLogProductsLogic";

const FormProductLog = () => {
  const {
    showAlert,
    itemListOptions,
    pendingAction,
    formError,
    payload,
    handleInputChange,
    handleItemsChange,
    createProductLog,
    putProductLog,
    productsStatus,
    handleCancel,
    handleConfirmation,
    showConfirmation,
    isModalOpen,
    closeModal,
    currentRecordId,
    categories,
  } = useLogProductsLogic(); // Jang handle request
  const { full_name } = useAppSelector((state) => state.user);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const handler = currentRecordId ? () => putProductLog(currentRecordId) : createProductLog;
    showConfirmation("submit", handler);
  };

  return (
    <>
      <dialog
        id="record-modal"
        className={`overflow-y-scroll lg:py-4 h-screen overflow-x-hidden bg-base-300 modal modal-middle ${
          isModalOpen ? "modal-open" : "hidden"
        }`}>
        <form
          id="record-form-modal"
          onSubmit={(event: React.FormEvent) => handleSubmit(event)}
          className="flex flex-col items-center card bg-base-100 max-sm:w-full md:min-w-4xl h-full overflow-auto relative">
          {productsStatus == "loading" && <Loading />}
          <h1 className="flex justify-between mb-1 mt-10 font-bold text-2xl text-center col-span-2 w-full px-4">
            {currentRecordId !== null ? "Update record" : "Tambah record baru"}
            <button
              type="button"
              onClick={() => closeModal()}
              id="dismiss-product-log-modal"
              className="px-2  btn btn-error self-end md:mb-2 col-span-3">
              <XMarkIcon className="h-5 w-5 text-red font-bold" />
            </button>
          </h1>

          {/* INPUT nama */}
          <div className="w-full px-4 mb-4 mt-2 space-y-2 hidden">
            <label
              htmlFor="nama"
              className="font-semibold input w-full">
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
                required
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
              className="input w-full font-semibold"
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
                placeholder={`Bumi Pak Dadang`}
                className=" w-full"
                required
              />
            </label>
            {formError.inputError.errorLokasi && <p>LOKASI belum diisi</p>}
          </div>

          {/* INPUT Kategori BARANG */}
          <div className="w-full px-4 mb-4 mt-2 space-y-2">
            <label
              className={`font-semibold select w-full ${formError.inputError.errorKategori && "select-error"}`}
              htmlFor="kategori">
              <span className="min-w-20">
                Kategori <span className="text-red-600 mr-3">*</span>
              </span>
              <select
                name="kategori_id"
                value={payload.kategori_id || ""}
                id="katergori"
                required
                onChange={(e) => handleInputChange("kategori_id", parseInt(e.target.value))}
                className={`border p-2 w-full ${formError.inputError.errorKategori && "select-error"}`}>
                <option
                  value={""}
                  disabled>
                  Pilih Kategori
                </option>
                {categories &&
                  categories.map((cat, index) => (
                    <option
                      key={index}
                      value={cat.kategori_id}>
                      {cat.nama_kategori}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {/* INPUT DAFTAR BARANG */}
          <div className="w-full px-4 mb-4 mt-2 space-y-2">
            <label
              htmlFor="nama_barang_0"
              className="font-semibold">
              {/* List Barang <span className="text-red-600">*</span> */}
              {/* <span className="text-gray-400">(dalam bentuk pcs/meter)</span> */}
              <BarangInput
                items={payload.item_list}
                setItems={handleItemsChange}
                itemsOptions={itemListOptions}
              />
            </label>
          </div>

          {/* INPUT Keterangan */}
          <div className="w-full px-4 mb-4 mt-2 space-y-2">
            <fieldset className="fieldset">
              <legend className="font-bold">
                Keterangan <span className="text-gray-400">Opsional</span>
              </legend>
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
              id="dismiss-product-log-modal"
              className="px-6 btn bg-base-300 ">
              Close
            </button>
          </div>
        </form>
      </dialog>
      <AlertModal
        isOpen={showAlert}
        content={pendingAction?.type === "delete" ? "Yakin hapus data ini?" : "Konfirmasi pengiriman data"}
        action={pendingAction?.type}
        primaryBtnStyle={pendingAction?.type === "delete" ? "error" : "success"}
        onConfirm={handleConfirmation}
        onCancel={handleCancel}
      />
    </>
  );
};

export default FormProductLog;
