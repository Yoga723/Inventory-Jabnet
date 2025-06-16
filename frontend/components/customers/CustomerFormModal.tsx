"use client";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <dialog
      open
      className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{customerData?.id ? "Edit Customer" : "Add Customer"}</h3>
        <form onSubmit={onSubmit} className="">
          <div className="grid grid-cols-2 gap-6 ">
            <label className="input">
              <span className="label">Nama</span>
              <input
                type="text"
                name="name"
                value={customerData?.name || ""}
                onChange={handleChange}
                className=""
                required
              />
            </label>
            <label className="input">
              <span className="label">No HP</span>
              <input
                type="text"
                name="no_telepon"
                value={customerData?.no_telepon || ""}
                onChange={handleChange}
                className=""
                required
              />
            </label>

            <label className="input">
              <span className="label">Address</span>
              <input
                type="text"
                name="address"
                value={customerData?.address || ""}
                onChange={handleChange}
                className=""
              />
            </label>

            <label className="input">
              <span className="label">SN</span>
              <input
                type="text"
                name="sn"
                value={customerData?.sn || ""}
                onChange={handleChange}
                className=""
              />
            </label>

            <label className="input">
              <span className="label">OLT</span>
              <input
                type="text"
                name="olt"
                value={customerData?.olt || ""}
                onChange={handleChange}
                className=""
              />
            </label>

            <label className="input">
              <span className="label">ODP</span>
              <input
                type="text"
                name="odp"
                value={customerData?.odp || ""}
                onChange={handleChange}
                className=""
              />
            </label>

            <label className="input">
              <span className="label">Port ODP</span>
              <input
                type="text"
                name="port_odp"
                value={customerData?.port_odp || ""}
                onChange={handleChange}
                className=""
              />
            </label>
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
      </div>
    </dialog>
  );
};

export default CustomerFormModal;
