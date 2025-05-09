"use client";
import { Button, Dialog, Input, Textarea, Typography } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import useRecordsLogic from "../../app/hooks/useRecordsLogic";
import BarangInput from "../BarangInput";
import Loading from "../Loading";

interface formRecordsProps {
  method: "PUT" | "POST";
  record_id?: number;
}

const FormRecords = (props: formRecordsProps) => {
  const { method, record_id } = props;

  const { payload, loading, handleInputChange, handleItemsChange, createRecord, getRecords, populateForm, putRecord } =
    useRecordsLogic();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (method === "PUT") {
      populateForm(record_id);
    }
    setIsOpen(true);
  };

  return (
    <Dialog
      size="lg"
      open={isOpen}>
      <Dialog.Trigger
        as={Button}
        onClick={handleOpen}
        className={`jabnet-btn-template ${
          method === "POST"
            ? "from-[#D55226] to-[#F47146] shadow-[0px_2px_10px_0px_#F47146] hover:shadow-[0px_2px_20px_0px_#F47146]"
            : "from-[#D89013] to-[#faa91d] shadow-[0px_2px_10px_0px_#D89013] hover:shadow-[0px_2px_20px_0px_#faa91d]"
        }`}>
        {method === "POST" ? `Tambah` : `Edit`}
      </Dialog.Trigger>
      <Dialog.Overlay
        className="flex justify-center items-center w-full h-full bg-[rgba(0,0,0,0.35)] max-md:pt-4 md:p-[5%] z-40"
        id="record-form-modal">
        <Dialog.Content className="modal-content p-4 pt-36 md:px-12 relative w-full md:w-[80%]">
          <Typography
            type="h4"
            className="mb-1 font-bold text-lg">
            {method == "POST" ? "Tambah record baru" : "Update record"}
          </Typography>

          <form
            onSubmit={method == "POST" ? (e) => createRecord(e) : (e) => putRecord(e, record_id)}
            className="mt-6 flex flex-col">
            {loading && <Loading />}
            {/* INPUT nama */}
            <div className="px-4 mb-4 mt-2 space-y-2">
              <Typography
                as="label"
                htmlFor="nama"
                type="small"
                color="default"
                className="font-semibold">
                Nama <span className="text-red-600">*</span>
              </Typography>
              <Input
                id="nama"
                name="nama"
                type="nama"
                className="px-4 "
                value={payload.nama}
                onChange={(e) => handleInputChange("nama", e.target.value)}
                placeholder="Asep, Cecep, Kasep"
              />
            </div>
            {/* INPUT status */}
            <div className="px-4 mb-4 mt-2 space-y-2 gap-4">
              <Typography
                as="label"
                htmlFor="status"
                type="small"
                color="default"
                className="font-semibold">
                Status <span className="text-red-600">*</span>
              </Typography>
              <select
                value={payload.status}
                name="status"
                id="status"
                onChange={(e) => handleInputChange("status", e.target.value as "Masuk" | "Keluar")}
                className="border p-2 w-full">
                <option value="Masuk">Masuk</option>
                <option value="Keluar">Keluar</option>
              </select>
            </div>

            {/* INPUT lokasi BARANG */}
            <div className="px-4 mb-4 mt-2 space-y-2">
              <Typography
                as="label"
                htmlFor="lokasi"
                type="small"
                color="default"
                className="font-semibold">
                Lokasi <span className="text-red-600">*</span>
              </Typography>
              <Input
                id="lokasi"
                name="lokasi"
                type="text"
                value={payload.lokasi}
                onChange={(e) => handleInputChange("lokasi", e.target.value)}
                className="px-4 "
                placeholder={`Bumi pak dadang`}
              />
            </div>

            {/* INPUT DAFTAR BARANG */}
            <div className="px-4 mb-4 mt-2 space-y-2">
              <Typography
                as="label"
                htmlFor="items_0"
                type="small"
                color="default"
                className="font-semibold">
                List Barang <span className="text-red-600">*</span>{" "}
                <span className="text-gray-400">(dalam bentuk pcs/meter)</span>
              </Typography>
              <BarangInput
                items={payload.list_barang}
                setItems={handleItemsChange}
              />
            </div>

            {/* INPUT nilai BARANG */}
            <div className="px-4 mb-4 mt-2 space-y-2">
              <Typography
                as="label"
                htmlFor="nilai"
                type="small"
                color="default"
                className="font-semibold">
                Total Harga Barang <span className="text-gray-400 text-xs"> Opsional</span>
              </Typography>
              <Input
                id="nilai"
                name="nilai"
                type="number"
                value={payload.nilai}
                onChange={(e) => handleInputChange("nilai",e.target.value)}
                pattern="[0-9.,]*"
                className="px-2"
                placeholder={`2500000`}
              />
              {/* <Input
                id="nilai"
                name="nilai"
                type="text"
                value={payload.nilai}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  handleInputChange("nilai", value);
                }}
                pattern="[0-9.,]*"
                className="px-2"
                placeholder={`2.500.000`}
              /> */}
            </div>

            {/* INPUT Keterangan */}
            <div className="px-4 mb-4 mt-2 space-y-2">
              <Typography
                as="label"
                htmlFor="keterangan"
                type="small"
                color="default"
                className="font-semibold">
                Keterangan <span className="text-gray-400 text-xs"> Opsional</span>
              </Typography>
              <Textarea
                id="keterangan"
                name="keterangan"
                className="p-2"
                value={payload.keterangan}
                onChange={(e) => handleInputChange("keterangan", e.target.value)}
                placeholder={``}
              />
            </div>

            <div className="modal-footer">
              <Button
                type="submit"
                className="submit-trigger">
                Kirim
              </Button>
              <Dialog.DismissTrigger
                as={Button}
                type="button"
                onClick={() => setIsOpen(false)}
                id="dismiss-record-modal"
                className="dismiss-trigger">
                Close
              </Dialog.DismissTrigger>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog>
  );
};

export default FormRecords;
