"use client";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useState } from "react";
import { useAppDispatch } from "../store/Hooks";
import FormRecords from "./modals/FormRecords";
import { useFilterSearchLogic } from "../app/hooks/useFilterSearchLogic";
import DatePicker from "react-datepicker";
import { fetchRecordsThunk } from "../store/recordSlice";

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
    <div className="flex flex-wrap gap-3 my-5 justify-start items-center">
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
          type="button" // Explicitly type button
          className="inline-flex justify-center items-center w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md cursor-pointer"
          id="filter-menu"
          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          aria-haspopup="true"
          aria-expanded="false">
          <Image
            width={15}
            height={15}
            src="https://img.icons8.com/ios/100/filter--v1.png"
            alt="filter--v1"
            className="mr-1"
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
          className="inline-flex justify-center items-center w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md cursor-pointer"
          onClick={() => setIsDateOpen(!isDateOpen)}>
          <Image
            width={15}
            height={15}
            src="https://img.icons8.com/ios/100/calendar--v1.png"
            alt="calendar"
            className="mr-1"
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
      <FormRecords method={"POST"} />
    </div>
  );
};

export default UtilityBar;
