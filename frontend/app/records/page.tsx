"use client";
import React from "react";
import Header from "../../components/Header";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FormRecords from "../../components/modals/FormRecords";
import Image from "next/image";
import RecordTable from "../../components/records/RecordTable";
import { Provider } from "react-redux";
import { store } from "../../store";

const page = () => {
  return (
    <>
      <Header />
      <main className="overflow-x-auto min-h-screen max-h-[1280px] antialiased md:px-12 mt-20">
        {/* Utility (Search, Filter, and Tambah button) */}
        <div className="flex gap-5 my-5 justify-start items-center">
          {/* Search Input */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 w-full sm:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
            <input
              name="search"
              id="search"
              type="text"
              placeholder="Cari pake nama atau barang"
              className="max-sm:min-w-[170px] w-full focus:outline-none text-sm"
            />
          </div>
          {/* Filter Dropdown */}
          <div className="relative inline-block text-left">
            <button
              className="inline-flex justify-center items-center w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md cursor-pointer"
              id="filter-menu"
              aria-haspopup="true"
              aria-expanded="true">
              <Image
                width={15}
                height={15}
                src="https://img.icons8.com/ios/100/filter--v1.png"
                alt="filter--v1"
              />
              <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-500" />
            </button>
            {/* Dropdown items */}
            <div
              className="origin-top-left absolute left-0 mt-1 w-40 hidden rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[3]"
              role="menu"
              id="dropdown-filter"
              aria-orientation="vertical"
              aria-labelledby="filter-menu">
              <div className="py-1">
                {["All", "Withdraw", "Deposit"].map((opt) => (
                  <button
                    key={opt}
                    // onClick={() => setFilter(opt)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    role="menuitem">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Tambah Button */}
          <FormRecords method={"POST"} />
        </div>
        <RecordTable />
      </main>
    </>
  );
};

export default page;
