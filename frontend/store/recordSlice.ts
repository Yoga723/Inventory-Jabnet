import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { recordsProp } from "../types";

const API_BASE_URL = "http://inventory.jabnet.id/api/records";

export interface recordState {
  items: recordsProp[];
  currentItem: recordsProp | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: recordState = {
  items: [],
  currentItem: null,
  status: "idle",
  error: null,
};

// Function untuk ambil data dari database
export const fetchRecordsThunk = createAsyncThunk("records/fetchRecordsThunk", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseData = await response.json();

    if (!response.ok) return rejectWithValue(responseData.error || `HTTP Error! Status :${response.status}`);
    return responseData.data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch records due to a network or unexpected error");
  }
});

export const fetchRecordByIdThunk = createAsyncThunk(
  `records/fetchRecordByIdThunk`,
  async (record_id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${record_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const response = await res.json();
      if (!response.ok) return rejectWithValue(response.error || "Data tidak ditemukan !!");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Data tidak ditemukan !!");
    }
  }
);

export const createRecordsThunk = createAsyncThunk(
  "records/createRecord",
  async (
    // Omit hela record_id jeng tanggal dan eta mah opsional/dijien ti databasena
    //
    newRecordPayload: Omit<recordsProp, "record_id" | "tanggal" | "list_barang"> & {
      list_barang: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecordPayload),
      });

      const response = await res.json();

      if (!response.ok || response.status != 201)
        return rejectWithValue(response.error || response.message || `Gagal Kirim Data`);

      dispatch(fetchRecordsThunk());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Gagal Kirim data");
    }
  }
);

export const putRecordsThunk = createAsyncThunk(
  `records/putRecordsThunk`,
  async (
    {
      recordId,
      updatedRecordPayload,
    }: {
      recordId: number;
      updatedRecordPayload: Omit<recordsProp, "record_id" | "tanggal" | "list_barang"> & {
        list_barang: string;
      };
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecordPayload),
      });

      const response = await res.json();
      if (!response.ok) return rejectWithValue(response.error || "Gagal Update data, Coba lagi nanti !!");

      dispatch(fetchRecordsThunk());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Gagal Kirim data");
    }
  }
);

export const deleteRecordsThunk = createAsyncThunk(
  "records/deleteRecord",
  async (record_id: number, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${record_id}`, {
        method: "DELETE",
      });

      const response = await res.json();

      if (!response.ok) return rejectWithValue(response.error || "Data kemungkinan tidak ada. Gagal menghapus data !!");

      dispatch(fetchRecordsThunk());
      return record_id;
    } catch (error) {
      return rejectWithValue(error.message || "Gagal hapus data, Coba lagi nanti !!");
    }
  }
);

const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
      state.status = "idle";
      state.error = null;
    },
    resetRecordsStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  // asyncThunk sudah ada build-in on pending, rejected, fulfilled/success.
  // Jadi tinggal addCase pending = harus A, case fulfilled harus B, dst
  extraReducers(builder) {
    builder
      .addCase(fetchRecordsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRecordsThunk.fulfilled, (state, action: PayloadAction<recordsProp[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchRecordByIdThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRecordByIdThunk.fulfilled, (state, action: PayloadAction<recordsProp>) => {
        state.status = "succeeded";
        state.currentItem = action.payload;
      })
      .addCase(fetchRecordByIdThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createRecordsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createRecordsThunk.fulfilled, (state, action: PayloadAction<recordsProp>) => {
        state.status = "succeeded";
      })
      .addCase(createRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(putRecordsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(putRecordsThunk.fulfilled, (state, action: PayloadAction<recordsProp>) => {
        state.status = "succeeded";
        if (state.currentItem && state.currentItem.record_id === action.payload.record_id)
          state.currentItem = action.payload;
      })
      .addCase(putRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteRecordsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteRecordsThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = "succeeded";
        if (state.currentItem && state.currentItem.record_id === action.payload) {
          state.items = null;
          state.status = "idle";
        }
      })
      .addCase(deleteRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentItem, resetRecordsStatus } = recordSlice.actions;
export default recordSlice.reducer;
