import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Customers } from "types";

interface CustomersState {
  customers: Customers[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  totalCustomers: number;
  hasMore: boolean; // To know if there are more pages to load
}

const initialState: CustomersState = {
  customers: [],
  status: "loading",
  error: null,
  currentPage: 1,
  totalCustomers: 0,
  hasMore: true,
};

// Define the async thunk for fetching customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async ({ page, limit = 20 }: { page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://inventory.jabnet.id/api/customers?page=${page}&limit=${limit}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to fetch customers");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        // Append new customers to the existing list instead of replacing them
        state.customers = [...state.customers, ...action.payload.data];
        state.currentPage = action.payload.pagination.page;
        // Check if there are more customers to load
        state.hasMore = state.customers.length < action.payload.pagination.total;
        state.status = "succeeded";
        state.totalCustomers = action.payload.pagination.total;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default customersSlice.reducer;
