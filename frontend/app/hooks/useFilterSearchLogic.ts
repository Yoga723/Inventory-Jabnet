"use client";

import { useState } from "react";
import { addDays, formatISO, startOfDay, endOfDay } from "date-fns";
import { fetchRecordsThunk } from "../../store/recordSlice";
import { useAppDispatch } from "../../store/Hooks";

export const useFilterSearchLogic = () => {
  const dispatch = useAppDispatch();
  // state untuk search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFIlter] = useState("All");
  const [kategoriFilter, setKategoriFilter] = useState("All");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  // State untuk membuka modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "All") params.append("status", statusFilter);
    if (kategoriFilter !== "All") params.append("kategori", kategoriFilter);

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

  const handleStatusChange = (filter: string) => {
    setStatusFIlter(filter);
  };

  const handleKategoriChange = (kategoriFilter: string) => {
    setKategoriFilter(kategoriFilter);
  };

  const handleDateFilterChange = (days: string) => {
    setSelectedDateFilter(days);
  };

    const handleResetFilter = () => {
      setKategoriFilter("All");
      setStatusFIlter("All");
      setDateRange([null, null]);
      setSelectedDateFilter("");
      dispatch(fetchRecordsThunk(""));
    };

  const handleExport = async (event) => {
    event.preventDefault();
    if (!confirm("Export data ?")) return;
    const query = buildQueryParams();
    const url = `https://inventory.jabnet.id/api/records/export${query ? `?${query}` : ""}`;
    window.open(url, "_blank");
  };

  return {
    handleResetFilter,
    kategoriFilter,
    handleKategoriChange,
    handleExport,
    isFilterOpen,
    setIsFilterOpen,
    searchTerm,
    setSearchTerm,
    statusFilter,
    dateRange,
    setDateRange,
    selectedDateFilter,
    handleSearch,
    handleStatusChange,
    handleDateFilterChange,
    buildQueryParams,
  };
};
