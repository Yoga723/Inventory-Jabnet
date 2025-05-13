"use client";

import { useEffect, useState } from "react";
import { addDays, formatISO, startOfDay, endOfDay } from "date-fns";
import { fetchRecordsThunk } from "../../store/recordSlice";
import { useAppDispatch } from "../../store/Hooks";

export const useFilterSearchLogic = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const [selectedDateFilter, setSelectedDateFilter] = useState("");

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

  useEffect(() => {
    dispatch(fetchRecordsThunk(buildQueryParams()));
  }, [selectedFilter, selectedDateFilter, dateRange]);

  const handleSearch = () => dispatch(fetchRecordsThunk(buildQueryParams()));

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    dispatch(fetchRecordsThunk(buildQueryParams()));
  };

  const handleDateFilterChange = (days: string) => {
    setSelectedDateFilter(days);
    if (days !== "custom") {
      dispatch(fetchRecordsThunk(buildQueryParams()));
    }
  };

  return {
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
