"use client";

import { useState } from "react";
import { addDays, formatISO, startOfDay, endOfDay } from "date-fns";
import { fetchRecordsThunk } from "../../store/recordSlice";
import { useAppDispatch } from "../../store/Hooks";

export const useFilterSearchLogic = () => {
  const dispatch = useAppDispatch();
  // state untuk search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  // State untuk membuka modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedFilter !== "All") params.append("status", selectedFilter);

    if (selectedDateFilter === "custom" && dateRange[0] && dateRange[1]) {
      params.append("start_date", formatISO(startOfDay(dateRange[0])));
      params.append("end_date", formatISO(endOfDay(dateRange[1])));
    } else if (selectedDateFilter) {
      const days = parseInt(selectedDateFilter);
      if (!isNaN(days)) {
        const startDate = addDays(new Date(), -days);
        params.append("start_date", formatISO(startOfDay(startDate)));
        params.append("end_date", formatISO(endOfDay(new Date())));
      }
    }

    return params.toString();
  };

  const handleSearch = () => {
    dispatch(fetchRecordsThunk(buildQueryParams()));
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleDateFilterChange = (days: string) => {
    setSelectedDateFilter(days);
  };

  const handleExport = async (event) => {
    event.preventDefault();
    if (!confirm("Export data ?")) return;
    const query = buildQueryParams();
    const url = `https://inventory.jabnet.id/api/records/export${query ? `?${query}` : ""}`;
    window.open(url, "_blank");
  };

  return {
    handleExport,
    isFilterOpen,
    setIsFilterOpen,
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
  };
};
