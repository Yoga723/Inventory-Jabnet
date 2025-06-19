"use client";
import { BookOpenIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import { useLogProductSearchLogic } from "../../app/hooks/useLogProductSearchLogic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useProductsContext } from "context/products/ProductsContext";

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
  const {
    categories,
    kategoriFilter,
    handleResetFilter,
    handleKategoriChange,
    searchTerm,
    setSearchTerm,
    statusFilter,
    dateRange,
    setDateRange,
    selectedDateFilter,
    handleSearch,
    handleStatusChange,
    handleDateFilterChange,
    handleExport,
    isFilterOpen,
    setIsFilterOpen,
  } = useLogProductSearchLogic();

  const onSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearch();
  };
  const { openModal } = useProductsContext();

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
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={onSearchKey}
            type="text"
            className="w-full"
            placeholder="Search Nama atau Barang"
          />
        </label>

        <button
          type="button"
          onClick={(event) => handleExport(event)}
          className="btn btn-info btn-soft">
          <BookOpenIcon className="w-5 h-5 mr-2" />
          Export
        </button>

        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="btn btn- btn-soft">
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filter
        </button>
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
      </section>

      <dialog className={` modal bg-black bg-opacity-0 modal-middle ${isFilterOpen ? "modal-open" : "hidden"} `}>
        <form
          method="dialog"
          className="!overflow-visible modal-box max-w-md space-y-4 flex flex-col justify-center items-center min-h-[310px]">
          <h3 className="font-bold text-lg">Set Filter</h3>

          {/* Status */}
          <div className="w-full font-bold">
            <label
              className="label w-full"
              htmlFor="status-filter">
              <span className="label-text min-w-[70px]">Status</span>
              <select
                id="status-filter"
                className="select select-bordered w-full"
                value={statusFilter}
                onChange={(event) => handleStatusChange(event.target.value)}>
                <option>All</option>
                <option>Masuk</option>
                <option>Keluar</option>
              </select>
            </label>
          </div>

          {/* Kategori */}
          <div className="w-full font-bold">
            <label
              className="label w-full"
              htmlFor="kategori-filter">
              <span className="label-text min-w-[70px]">Kategori</span>
              <select
                id="kategori-filter"
                className="select select-bordered w-full"
                value={kategoriFilter}
                onChange={(event) => handleKategoriChange(event.target.value)}>
                <option value="All">All</option>
                {categories &&
                  categories.map((cat) => (
                    <option
                      key={cat.kategori_id}
                      value={cat.kategori_id}>
                      {cat.nama_kategori}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {/* Date */}
          <div className="w-full font-bold ">
            <label
              className="label w-full"
              htmlFor="tanggal-filter">
              <span className="label-text min-w-[70px]">Tanggal</span>
              <select
                id="tanggal-filter"
                className="select select-bordered w-full"
                value={selectedDateFilter}
                onChange={(event) => handleDateFilterChange(event.target.value)}>
                {dateOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <DatePicker
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(upd) => setDateRange(upd)}
              isClearable
              className={`input input-bordered w-full mt-6 border-test ${
                selectedDateFilter === "custom" ? "" : "invisible"
              }`}
            />
          </div>

          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => {
                handleResetFilter();
                setIsFilterOpen(false);
              }}
              className="btn bg-base-300">
              Reset Filter
            </button>
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
