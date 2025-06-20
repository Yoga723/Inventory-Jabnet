import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Customers } from "types";
const API_BASE_URL = "https://inventory.jabnet.id/api/customers";

interface CustomerFilters {
  sortBy?: string;
  sortOrder?: string;
  olt?: string;
  odp?: string;
  id_paket?: string;
  id_mitra?: string;
}

interface FetchCustomersArgs {
  page: number;
  limit?: number;
  search?: string;
  filterCustomers?: CustomerFilters;
}

interface CustomersState {
  customers: Customers[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  totalCustomers: number;
  hasMore: boolean;
}

const initialState: CustomersState = {
  customers: [],
  status: "idle",
  error: null,
  currentPage: 1,
  totalCustomers: 0,
  hasMore: true,
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async ({ page, limit = 20, search, filterCustomers = {} }: FetchCustomersArgs, { rejectWithValue }) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search && search.trim() != "") params.append("search", search);

    console.log(`THIS IS SEARCH PARAMS : ${API_BASE_URL}?${params.toString()}`);

    Object.entries(filterCustomers).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to fetch customers");
      }
      const data = await response.json();

      console.log("THIS IS DATA FETCHED", data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customer: Customers, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to create customer");
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ originalId, customerData }: { originalId: number; customerData: Customers }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${originalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to update customer");
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${customerId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to delete customer");
      }
      return customerId;
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
        state.customers = action.payload.data;
        state.currentPage = action.payload.pagination.page;
        state.totalCustomers = action.payload.pagination.total;
        state.hasMore = state.customers.length < action.payload.pagination.total;
        state.status = "succeeded";
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<Customers>) => {
        state.customers.unshift(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customers>) => {
        const index = state.customers.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.customers[index] = action.payload;
      })
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.customers = state.customers.filter((c) => c.id !== action.payload);
      });
  },
});

export default customersSlice.reducer;
