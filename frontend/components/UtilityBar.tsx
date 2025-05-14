"use client";
import { CalendarIcon, ChevronDownIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useState } from "react";
import { useAppDispatch } from "../store/Hooks";
import FormRecords from "./records/FormRecords";
import { useFilterSearchLogic } from "../app/hooks/useFilterSearchLogic";
import DatePicker from "react-datepicker";
import { fetchRecordsThunk } from "../store/recordSlice";
import { useRecordsContext } from "../context/records/RecordsContext";

const UtilityBar = () => {
  const dispatch = useAppDispatch();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
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
    buildQueryParams,
  } = useFilterSearchLogic();

  const { openModal } = useRecordsContext();

  const dateOptions = [
    { label: "All Time", value: "" },
    { label: "3 Hari", value: "3" },
    { label: "7 Hari", value: "7" },
    { label: "30 Hari", value: "30" },
    { label: "60 Hari", value: "60" },
    { label: "90 Hari", value: "90" },
    { label: "Custom Range", value: "custom" },
  ];

  const onSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearch();
  };
  return (
    <div className="flex flex-wrap gap-3 my-5 justify-start items-center w-full ">
      {/* Search Input */}
      <div className="flex items-center bg-white dark:bg-[#1D222D] border border-gray-300 rounded-md px-3 py-2 w-62 sm:w-auto md:w-64">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
        <input
          name="search"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={onSearchKey}
          type="text"
          placeholder="Cari pake nama atau barang"
          className="w-full focus:outline-none text-sm"
        />
      </div>
      <div className="relative inline-block text-left">
        <button
          type="button"
          className="btn btn-secondary btn-soft"
          id="filter-menu"
          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}>
          <FunnelIcon
            width={15}
            height={15}
            className="ml-1.5"
          />
          {selectedFilter}
          <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-500" />
        </button>
        {isStatusDropdownOpen && (
          <div
            className="origin-top-left absolute left-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[3]"
            role="menu"
            id="dropdown-filter"
            aria-orientation="vertical"
            aria-labelledby="filter-menu">
            <div className="py-1">
              {["All", "Masuk", "Keluar"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => {
                    handleFilterChange(opt);
                    setIsStatusDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                  role="menuitem">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="relative inline-block text-left">
        <button
          type="button"
          className="btn btn-secondary btn-soft"
          onClick={() => setIsDateOpen(!isDateOpen)}>
          <CalendarIcon
            width={15}
            height={15}
            className="ml-1.5"
          />
          Tanggal
          <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-500" />
        </button>
        {isDateOpen && (
          <div className="origin-top-left absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[3] p-2">
            <div className="space-y-1">
              {dateOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    handleDateFilterChange(option.value);
                    if (option.value !== "custom") setIsDateOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm rounded ${
                    selectedDateFilter === option.value
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}></button>
              ))}
            </div>
            {selectedDateFilter === "custom" && (
              <div className="mt-2 p-2 border-t">
                <DatePicker
                  selectsRange
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(update) => {
                    setDateRange(update);
                    setIsDateOpen(false);
                    if (update[0] && update[1]) dispatch(fetchRecordsThunk(buildQueryParams()));
                  }}
                  isClearable
                />
              </div>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => openModal(null)}
        className="btn btn-success btn-soft">
        <PlusIcon
          width={15}
          height={15}
          className="ml-1.5"
        />
        Tambah
      </button>
    </div>
  );
};

export default UtilityBar;
