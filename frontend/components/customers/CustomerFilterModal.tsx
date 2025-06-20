import { OLT_OPTIONS } from "app/utils/constants";
import React from "react";
import { useAppSelector } from "store/Hooks";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterCustomer: any;
  setFilters: (filterCustomer: any) => void;
  onApply: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filterCustomer, setFilters, onApply }) => {
  const { pakets, mitras } = useAppSelector((state) => state.filterCustomers);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filterCustomer, [name]: value });
  };

  const handleReset = () => {
    setFilters({
      sortBy: "last_edited",
      sortOrder: "ASC",
      olt: "",
      odp: "",
      id_paket: "",
      id_mitra: "",
    });
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Filter Customers</h3>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Sort By</legend>
          <select
            name="sortBy"
            value={filterCustomer.sortBy}
            onChange={handleChange}
            className="select select-bordered">
            <option value="last_edited">Last Edited</option>
            <option value="name">Name</option>
            <option value="id">Customer ID</option>
          </select>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Sort Order</legend>
          <select
            name="sortOrder"
            value={filterCustomer.sortOrder}
            onChange={handleChange}
            className="select select-bordered">
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">OLT</legend>
          <select
            name="olt"
            value={filterCustomer.olt}
            onChange={handleChange}
            className="select select-bordered">
            <option value="">All OLTs</option>
            {OLT_OPTIONS.map((opt) => (
              <option
                key={opt}
                value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Paket Internet</legend>
          <select
            name="id_paket"
            value={filterCustomer.id_paket}
            onChange={handleChange}
            className="select select-bordered">
            <option value="">All Packages</option>
            {pakets.map((p) => (
              <option
                key={p.id_paket}
                value={p.id_paket}>
                {p.nama_paket}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Mitra</legend>
          <select
            name="id_mitra"
            value={filterCustomer.id_mitra}
            onChange={handleChange}
            className="select select-bordered">
            <option value="">All Partners</option>
            {mitras.map((m) => (
              <option
                key={m.id_mitra}
                value={m.id_mitra}>
                {m.nama_mitra}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">ODP</legend>
          <input
            type="text"
            name="odp"
            value={filterCustomer.odp}
            onChange={handleChange}
            placeholder="Enter ODP"
            className="input input-bordered"
          />
        </fieldset>

        <div className="modal-action">
          <button
            onClick={handleReset}
            className="btn btn-ghost">
            Reset
          </button>
          <button
            onClick={onClose}
            className="btn ">
            Cancel
          </button>
          <button
            onClick={onApply}
            className="btn btn-primary">
            Apply
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default FilterModal;
