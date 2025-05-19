import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { recordsProp } from "../types";
import { getLocalStorageItem, StorageKeys } from "app/utils/localStorage";

const API_BASE_URL = "https://inventory.jabnet.id/api/records";

interface FieldUpdate {
  field: keyof recordsProp;
  value: any;
}

export interface recordState {
  items: recordsProp[];
  currentItem: recordsProp | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  isHomeLoading?: true | false;
  error: string | null;
}

const initialState: recordState = {
  items: [],
  currentItem: {
    nama: "",
    status: "Masuk",
    lokasi: "",
    list_barang: [{ nama_barang: "", qty: 1 }],
    nilai: 0,
    tanggal: new Date().toISOString(),
    keterangan: "",
  },
  status: "idle",
  isHomeLoading: true,
  error: null,
};

// Function untuk ambil data dari database
export const fetchRecordsThunk = createAsyncThunk(
  "records/fetchRecordsThunk",
  async (query: string = "", { rejectWithValue }) => {
    try {
      const token = getLocalStorageItem(StorageKeys.auth_token)
      const url = query && query.length > 2 ? `${API_BASE_URL}?${query}` : API_BASE_URL;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });

      const responseData = await response.json();

      if (!response.ok) return rejectWithValue(responseData.error || `HTTP Error! Status :${response.status}`);
      return responseData.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch records due to a network or unexpected error");
    }
  }
);

export const fetchRecordByIdThunk = createAsyncThunk(
  `records/fetchRecordByIdThunk`,
  async (record_id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${record_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) return rejectWithValue(res.status || "Data tidak ditemukan !!");
      const response = await res.json();

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

      if (!res.ok) return rejectWithValue(`Gagal Kirim Data (Status: ${res.status})`);

      const response = await res.json();

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
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecordPayload),
      });

      if (!res.ok) return rejectWithValue(res.status || "Gagal Update data, Coba lagi nanti !!");
      const response = await res.json();

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
      if (!res.ok) return rejectWithValue(`Data kemungkinan tidak ada. Error Code : ${res.status}`);

      await res.json();

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
      state.currentItem = initialState.currentItem;
      state.status = "idle";
      state.error = null;
    },
    updateCurrentItemField: (state, action: PayloadAction<FieldUpdate>) => {
      const { field, value } = action.payload;
      if (!state.currentItem) return;
      // @ts-ignore
      state.currentItem[field] = value;
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
        state.isHomeLoading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRecordsThunk.fulfilled, (state, action: PayloadAction<recordsProp[]>) => {
        state.isHomeLoading = false;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRecordsThunk.rejected, (state, action) => {
        state.isHomeLoading = false;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchRecordByIdThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRecordByIdThunk.fulfilled, (state, action: PayloadAction<recordsProp>) => {
        state.status = "succeeded";
        // Set men keterangan null jadina empty string
        state.currentItem = { ...action.payload, keterangan: action.payload.keterangan ?? "" };
      })
      .addCase(fetchRecordByIdThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createRecordsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createRecordsThunk.fulfilled, (state, { payload }) => {
        state.items.unshift(payload);
        state.status = "succeeded";
        clearCurrentItem;
      })
      .addCase(createRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(putRecordsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(putRecordsThunk.fulfilled, (state, { payload }) => {
        state.items = state.items.map((item) => (item.record_id === payload.record_id ? payload : item));
        state.status = "succeeded";
      })
      .addCase(putRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteRecordsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteRecordsThunk.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((item) => item.record_id !== payload);
        state.status = "succeeded";
      })
      .addCase(deleteRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetRecordsStatus, clearCurrentItem, updateCurrentItemField } = recordSlice.actions;
export default recordSlice.reducer;
