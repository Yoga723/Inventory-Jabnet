"use client";

import { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState<{ kategori_id: number; nama_kategori: string }[]>([]);

  // State untuk membuka modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch categories when filter modal opens
  useEffect(() => {
    if (!isFilterOpen) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://inventory.jabnet.id/api/records/kategori", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          const text = await response.text();
          console.error("Error fetching categories:", response.status, text);
          return;
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [isFilterOpen]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "All") params.append("status", statusFilter);
    if (kategoriFilter !== "All" && kategoriFilter !== "") params.append("kategori_id", kategoriFilter);

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
    categories,
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
