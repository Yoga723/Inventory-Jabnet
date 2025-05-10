import React from "react";
import Header from "../../components/Header";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FormRecords from "../../components/modals/FormRecords";
import Image from "next/image";
import RecordTable from "../../components/records/RecordTable";

const RecordsPage = () => {
  return (
    <>
      <Header />
      <main className="overflow-x-auto min-h-screen max-h-[1280px] antialiased md:px-12 mt-20">
        {/* Utility (Search, Filter, and Tambah button) */}
        <div className="flex flex-wrap gap-3 my-5 justify-start items-center">
          {" "}
          {/* flex-wrap and gap-3 for responsiveness */}
          {/* Search Input */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto md:w-64">
            {" "}
            {/* Responsive width */}
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
            <input
              name="search"
              id="search"
              type="text"
              placeholder="Cari pake nama atau barang"
              className="w-full focus:outline-none text-sm" // w-full inside flex container
              // Add onChange handler if search becomes active, likely in a separate client component
            />
          </div>
          {/* Filter Dropdown - This would need to be a client component for interactivity */}
          <div className="relative inline-block text-left">
            <button
              type="button" // Explicitly type button
              className="inline-flex justify-center items-center w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md cursor-pointer"
              id="filter-menu"
              aria-haspopup="true"
              aria-expanded="false" // Should be managed by state if interactive
              // onClick={() => toggleDropdown()} // Example for interactivity
            >
              <Image
                width={15}
                height={15}
                src="https://img.icons8.com/ios/100/filter--v1.png"
                alt="filter--v1"
                className="mr-1" // Added margin for icon
              />
              Filter
              <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-500" />
            </button>
            {/* Dropdown items - visibility needs to be managed by state (e.g. isDropdownOpen) */}
            {/* Example: {isDropdownOpen && ( ... )} */}
            <div
              className="origin-top-left absolute left-0 mt-1 w-40 hidden rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[3]" // 'hidden' class, manage with state
              role="menu"
              id="dropdown-filter"
              aria-orientation="vertical"
              aria-labelledby="filter-menu">
              <div className="py-1">
                {["All", "Masuk", "Keluar"].map(
                  (
                    opt 
                  ) => (
                    <button
                      type="button"
                      key={opt}
                      // onClick={() => { setFilter(opt); closeDropdown(); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Added text color
                      role="menuitem">
                      {opt}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
          {/* Tambah Button - FormRecords is a Client Component */}
          <FormRecords method={"POST"} />
        </div>

        <RecordTable />
      </main>
    </>
  );
};

export default RecordsPage;
