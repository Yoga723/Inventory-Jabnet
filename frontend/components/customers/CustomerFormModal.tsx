"use client";
import { XMarkIcon } from "@heroicons/react/24/solid";
import React from "react";
import { Customers } from "types";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  customerData: Partial<Customers> | null;
  setCustomerData: React.Dispatch<React.SetStateAction<Partial<Customers> | null>>;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerData,
  setCustomerData,
}) => {
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <dialog
      open
      className="modal modal-open">
      <aside className="modal-box max-sm:h-[90%] h-fit ">
        <div className="flex w-full justify-between">
          <h3 className="font-bold text-lg">{customerData?.id ? "Edit Customer" : "Add Customer"}</h3>
          <button
            type="button"
            onClick={onClose}
            id="dismiss-product-log-modal"
            className="px-2  btn btn-error self-end md:mb-2 col-span-3">
            <XMarkIcon className="h-5 w-5 text-red font-bold" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">
                ID Pelanggan <span className="text-red-500">*</span>
              </legend>
              <input
                type="text"
                name="id"
                value={customerData?.id || ""}
                onChange={handleChange}
                className="input"
                required
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">
                Nama <span className="text-red-500">*</span>
              </legend>
              <input
                type="text"
                name="name"
                value={customerData?.name || ""}
                onChange={handleChange}
                className="input"
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">
                No HP <span className="text-red-500">*</span>
              </legend>
              <input
                type="text"
                name="no_telepon"
                value={customerData?.no_telepon || ""}
                onChange={handleChange}
                className="input"
                required
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">
                Alamat <span className="text-red-500">*</span>
              </legend>
              <textarea
                name="address"
                className="textarea h-24"
                value={customerData?.address || ""}
                onChange={handleChange}
                placeholder="Alamat"></textarea>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">SN</legend>
              <input
                type="text"
                name="sn"
                value={customerData?.sn || ""}
                onChange={handleChange}
                className="input"
              />
              <p className="label">Opsional</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">OLT</legend>
              <input
                type="text"
                name="olt"
                value={customerData?.olt || ""}
                onChange={handleChange}
                className="input"
              />
              <p className="label">Opsional</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">ODP</legend>
              <input
                type="text"
                name="odp"
                value={customerData?.odp || ""}
                onChange={handleChange}
                className="input"
              />
              <p className="label">Opsional</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend text-md">Port ODP</legend>
              <input
                type="text"
                name="port_odp"
                value={customerData?.port_odp || ""}
                onChange={handleChange}
                className="input"
              />
              <p className="label">Opsional</p>
            </fieldset>
          </div>

          <div className="flex justify-center gap-6 mt-10">
            <button
              type="button"
              className="btn"
              onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </aside>
    </dialog>
  );
};

export default CustomerFormModal;
