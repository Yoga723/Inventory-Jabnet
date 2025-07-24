import {
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import React from "react";

const UtilBar = ({
  onAdd,
  onOpenFilters,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
}: {
  onAdd: () => void;
  onOpenFilters: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder?: string;
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") onSearchSubmit();
  };
  return (
    <>
      <section className="flex flex-wrap gap-3 my-5 justify-start items-center max-sm:justify-around w-full">
        {/* Search Input */}
        <label
          htmlFor="search"
          className="input relative bg-none max-sm:w-full overflow-hidden">
          <span>
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
          </span>
          <input
            name="search"
            id="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            className="w-full"
            placeholder={searchPlaceholder ? searchPlaceholder : "Search"}
          />
          <button
            type="button"
            onClick={onSearchSubmit}
            className="btn btn-ghost hover:cursor-pointer bg-base-300 p-2 rounded-lg absolute right-0">
            Search
          </button>
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
          onClick={onOpenFilters}
          className="btn btn-secondary btn-outline">
          <AdjustmentsHorizontalIcon
            width={20}
            height={20}
          />
          Filter
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="btn btn-primary btn-outline">
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
