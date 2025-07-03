import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Paket } from "types";
const API_BASE_URL = "https://inventory.jabnet.id/api/paket";

interface PaketState {
  paket: Paket[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PaketState = {
  paket: [],
  status: "idle",
  error: null,
};

export const fetchPakets = createAsyncThunk("paket/fetchPakets", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.error || "Failed to fetch paket");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createPaket = createAsyncThunk(
  "paket/createPaket",
  async (paket: Omit<Paket, "id_paket">, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paket),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create paket");
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePaket = createAsyncThunk(
  "paket/updatePaket",
  async ({ id, paket }: { id: number; paket: Omit<Paket, "id_paket"> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paket),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update paket");
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePaket = createAsyncThunk("paket/deletePaket", async (id: number, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.status !== 204) throw new Error("Failed to delete paket");
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const paketSlice = createSlice({
  name: "paket",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchPakets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPakets.fulfilled, (state, action: PayloadAction<Paket[]>) => {
        state.status = "succeeded";
        state.paket = action.payload || [];
      })
      .addCase(fetchPakets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createPaket.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createPaket.fulfilled, (state, action: PayloadAction<Paket>) => {
        state.paket.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(createPaket.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updatePaket.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePaket.fulfilled, (state, action: PayloadAction<Paket>) => {
        const updated = action.payload;
        const idx = state.paket.findIndex((p) => p.id_paket === updated.id_paket);
        if (idx !== -1) {
          state.paket[idx] = updated;
        }
        state.status = "succeeded";
      })
      .addCase(deletePaket.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePaket.fulfilled, (state, action: PayloadAction<number>) => {
        state.paket = state.paket.filter((p) => p.id_paket !== action.payload);
        state.status = "succeeded";
      });
  },
});

export default paketSlice.reducer;