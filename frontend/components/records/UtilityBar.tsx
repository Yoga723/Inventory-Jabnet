"use client";
import { BookOpenIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useFilterSearchLogic } from "../../app/hooks/useFilterSearchLogic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRecordsContext } from "../../context/records/RecordsContext";

const dateOptions = [
  { label: "All Time", value: "" },
  { label: "3 Hari", value: "3" },
  { label: "7 Hari", value: "7" },
  { label: "30 Hari", value: "30" },
  { label: "60 Hari", value: "60" },
  { label: "90 Hari", value: "90" },
  { label: "Custom", value: "custom" },
];

const UtilityBar = () => {
  const { openModal } = useRecordsContext(); // Untuk buka form tambah
  const {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    dateRange,
    setDateRange,
    selectedDateFilter,
    handleSearch,
    handleFilterChange,
    handleDateFilterChange,
    handleExport,
    isFilterOpen,
    setIsFilterOpen,
  } = useFilterSearchLogic();

  const onSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearch();
  };
  return (
    <>
      <section className="flex flex-wrap gap-3 my-5 justify-start items-center max-sm:justify-around w-full">
        {/* Search Input */}
        <label
          htmlFor="search"
          className="input bg-none max-sm:w-full">
          <span>
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
          </span>
          <input
            name="search"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={onSearchKey}
            type="text"
            className="w-full"
            placeholder="Search Nama atau Barang"
          />
        </label>

        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="btn btn-neutral btn-soft">
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filter
        </button>

        <button
          type="button"
          onClick={(event) => handleExport(event)}
          className="btn btn-info btn-soft">
          <BookOpenIcon className="w-5 h-5 mr-2" />
          Export
        </button>
      </section>

      <dialog className={` modal bg-black bg-opacity-0 modal-middle ${isFilterOpen ? "modal-open" : "hidden"}`}>
        <form
          method="dialog"
          className="!overflow-visible modal-box max-w-md space-y-4 flex flex-col justify-center items-center">
          <h3 className="font-bold text-lg">Set Filter</h3>

          {/* Status */}
          <div className="w-full">
            <label
              className="label"
              htmlFor="status-filter">
              <span className="label-text">Status</span>
            </label>
            <select
              id="status-filter"
              className="select select-bordered w-full"
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}>
              <option>All</option>
              <option>Masuk</option>
              <option>Keluar</option>
            </select>
          </div>

          {/* Date */}
          <div className="w-full">
            <label
              className="label"
              htmlFor="tanggal-filter">
              <span className="label-text">Tanggal</span>
            </label>
            <select
              id="tanggal-filter"
              className="select select-bordered w-full"
              value={selectedDateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}>
              {dateOptions.map((o) => (
                <option
                  key={o.value}
                  value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {selectedDateFilter === "custom" && (
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(upd) => setDateRange(upd)}
                isClearable
                className="input input-bordered w-full mt-6"
              />
            )}
          </div>

          <div className="w-full flex justify-center gap-10">
            <button
              onClick={() => {
                handleSearch();
                setIsFilterOpen(false);
              }}
              className="btn btn-success">
              Set Filter
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="btn bg-base-300">
              Close
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};

export default UtilityBar;
