import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { productsProp } from "../types";
const API_BASE_URL = "https://inventory.jabnet.id/api/records";

interface FieldUpdate {
  field: keyof productsProp;
  value: any;
}

export interface recordState {
  items: productsProp[];
  currentItem: productsProp | null;
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
    item_list: [{ item_name: "", qty: 1, price_per_item: 0 }],
    nilai: 0,
    tanggal: new Date().toISOString(),
    keterangan: "",
    kategori: "",
  },
  status: "idle",
  isHomeLoading: true,
  error: null,
};

// Function untuk ambil data dari database baik semuanya atau dengan filter
export const fetchProductsThunk = createAsyncThunk(
  "records/fetchProductsThunk",
  async (query: string = "", { rejectWithValue }) => {
    try {
      const url = query && query.length > 2 ? `${API_BASE_URL}?${query}` : API_BASE_URL;
      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        mode: "cors",
        // headers: { "Content-Type": "application/json" },
      });

      const responseData = await response.json();

      if (!response.ok) {
        window.location.href = "/login";
        return rejectWithValue(responseData.error || `HTTP Error! Status :${response.status}`);
      }
      return responseData.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch records due to a network or unexpected error");
    }
  }
);

// Ambil data dari database berdasarkan ID
export const fetchProductsByIdThunk = createAsyncThunk(
  `records/fetchProductsByIdThunk`,
  async (record_id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${record_id}`, {
        method: "GET",
        // headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) return rejectWithValue(res.status || "Data tidak ditemukan !!");
      const response = await res.json();

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Data tidak ditemukan !!");
    }
  }
);

export const createProductsThunk = createAsyncThunk(
  "records/createProductsThunk",
  async (
    // Omit hela record_id jeng tanggal dan eta mah opsional/dijien ti databasena
    newRecordPayload: Omit<productsProp, "record_id" | "tanggal" | "item_list"> & {
      item_list: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecordPayload),
        credentials: "include",
      });

      if (!res.ok) return rejectWithValue(`Gagal Kirim Data (Status: ${res.status})`);

      const response = await res.json();

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Gagal Kirim data");
    }
  }
);

export const putProductsThunk = createAsyncThunk(
  `records/putProductsThunk`,
  async (
    {
      recordId,
      updatedRecordPayload,
    }: {
      recordId: number;
      updatedRecordPayload: Omit<productsProp, "record_id" | "tanggal" | "item_list"> & {
        item_list: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecordPayload),
        credentials: "include",
      });

      if (!res.ok) return rejectWithValue(res.status || "Gagal Update data, Coba lagi nanti !!");
      const response = await res.json();

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Gagal Kirim data");
    }
  }
);

export const deleteProductsThunk = createAsyncThunk(
  "records/deleteProductLog",
  async (record_id: number, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${record_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return rejectWithValue(`Data kemungkinan tidak ada. Error Code : ${res.status}`);

      await res.json();

      return record_id;
    } catch (error) {
      return rejectWithValue(error.message || "Gagal hapus data, Coba lagi nanti !!");
    }
  }
);

const productsSlice = createSlice({
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
    resetproductsStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  // asyncThunk sudah ada build-in on pending, rejected, fulfilled/success.
  // Jadi tinggal addCase pending = harus A, case fulfilled harus B, dst
  extraReducers(builder) {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.isHomeLoading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action: PayloadAction<productsProp[]>) => {
        state.isHomeLoading = false;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.isHomeLoading = false;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchProductsByIdThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProductsByIdThunk.fulfilled, (state, action: PayloadAction<productsProp>) => {
        state.status = "succeeded";
        // Set men keterangan null jadina empty string
        state.currentItem = { ...action.payload, keterangan: action.payload.keterangan ?? "" };
      })
      .addCase(fetchProductsByIdThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createProductsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createProductsThunk.fulfilled, (state, { payload }) => {
        state.items.unshift({
          ...payload,
          item_list: Array.isArray(payload.item_list) ? payload.item_list : JSON.parse(payload.item_list || "[]"),
        });
        state.status = "succeeded";
        clearCurrentItem;
      })
      .addCase(createProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(putProductsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(putProductsThunk.fulfilled, (state, { payload }) => {
        state.items = state.items.map((item) =>
          item.record_id === payload.record_id
            ? {
                ...payload,
                item_list: Array.isArray(payload.item_list) ? payload.item_list : JSON.parse(payload.item_list || "[]"),
              }
            : item
        );
        state.status = "succeeded";
      })
      .addCase(putProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteProductsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteProductsThunk.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((item) => item.record_id !== payload);
        state.status = "succeeded";
      })
      .addCase(deleteProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetproductsStatus, clearCurrentItem, updateCurrentItemField } = productsSlice.actions;
export default productsSlice.reducer;
