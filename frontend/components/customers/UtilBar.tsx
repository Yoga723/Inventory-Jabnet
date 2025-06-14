import { BookOpenIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import React from "react";

const UtilBar = () => {
  return (
    <>
      {" "}
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
            // value={searchTerm}
            // onChange={(event) => setSearchTerm(event.target.value)}
            // onKeyDown={onSearchKey}
            type="text"
            className="w-full"
            placeholder="Search Nama atau Barang"
          />
        </label>

        {/* <button
          type="button"
        //   onClick={(event) => handleExport(event)}
          className="btn btn-info btn-soft">
          <BookOpenIcon className="w-5 h-5 mr-2" />
          Export
        </button> */}

        <button
          type="button"
        //   onClick={() => setIsFilterOpen(true)}
          className="btn btn- btn-soft">
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filter
        </button>
        <button
          type="button"
        //   onClick={() => openModal(null)}
          className="btn btn-primary btn-soft">
          <PlusIcon
            width={20}
            height={20}
            className="ml-1.5"
          />
          Tambah
        </button>
      </section>
    </>
  );
};

export default UtilBar;
