/**
 * @description Redux slice to manage shared data for filtering, like pakets and mitras.
 */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Mitra, Paket } from "types";

// Base URLs for the new endpoints
const API_PAKET_URL = "https://inventory.jabnet.id/api/paket";
const API_MITRA_URL = "https://inventory.jabnet.id/api/mitras";

interface FiltersState {
  pakets: Paket[];
  mitras: Mitra[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: FiltersState = {
  pakets: [],
  mitras: [],
  status: "idle",
  error: null,
};

// Async thunk to fetch internet packages
export const fetchPaket = createAsyncThunk("filterCustomer/fetchPaket", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_PAKET_URL, { credentials: "include" });
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.error || "Failed to fetch packages");
    }
    return await response.json();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Async thunk to fetch partners
export const fetchMitra = createAsyncThunk("filterCustomer/fetchMitra", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_MITRA_URL, { credentials: "include" });
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.error || "Failed to fetch partners");
    }
    return await response.json();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const filterCustomerSlice = createSlice({
  name: "filterCustomer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchPaket
      .addCase(fetchPaket.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPaket.fulfilled, (state, action: PayloadAction<Paket[]>) => {
        state.status = "succeeded";
        state.pakets = action.payload;
      })
      .addCase(fetchPaket.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Handle fetchMitra
      .addCase(fetchMitra.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMitra.fulfilled, (state, action: PayloadAction<Mitra[]>) => {
        state.status = "succeeded";
        state.mitras = action.payload;
      })
      .addCase(fetchMitra.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default filterCustomerSlice.reducer;
