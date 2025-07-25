import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "app/utils/apiConfig";
import { productsProp } from "types";

interface FieldUpdate {
  field: keyof productsProp;
  value: any;
}

interface FetchLogProductArg {
  query?: string;
  page?: number;
  limit?: number;
}

export interface ProductState {
  items: productsProp[];
  currentItem: productsProp | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  isHomeLoading?: true | false;
  error: string | null;
  currentPage: number;
  totalRecords: number;
  totalPages: number;
}

const initialState: ProductState = {
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
  currentPage: 1,
  totalRecords: 0,
  totalPages: 0,
};

// Function untuk ambil data dari database baik semuanya atau dengan filter
export const fetchLogProductsThunk = createAsyncThunk(
  "records/fetchLogProductsThunk",
  async ({ query = "", page = 1, limit = 20 }: FetchLogProductArg, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(query);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      const url = `${API_BASE_URL}/log-products?${params.toString()}`;
      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        mode: "cors",
      });

      const responseData = await response.json();

      if (!response.ok) {
        // window.location.href = "/login";
        return rejectWithValue(responseData.error || `HTTP Error! Status :${response.status}`);
      }
      return responseData;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch records due to a network or unexpected error");
    }
  }
);

// Ambil data dari database berdasarkan ID
export const fetchLogProductsByIdThunk = createAsyncThunk(
  `records/fetchLogProductsByIdThunk`,
  async (record_id: number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/log-products/${record_id}`, {
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

export const createLogProductsThunk = createAsyncThunk(
  "records/createLogProductsThunk",
  async (newRecordPayload: FormData, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/log-products`, {
        method: "POST",
        body: newRecordPayload,
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

export const putLogProductsThunk = createAsyncThunk(
  `records/putLogProductsThunk`,
  async (
    { recordId, updatedRecordPayload }: { recordId: number; updatedRecordPayload: FormData },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/log-products/${recordId}`, {
        method: "PUT",
        body: updatedRecordPayload,
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

export const deleteLogProductsThunk = createAsyncThunk(
  "records/deleteProductLog",
  async (record_id: number, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/log-products/${record_id}`, {
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

const logProductsSlice = createSlice({
  name: "logProducts",
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
      .addCase(fetchLogProductsThunk.pending, (state) => {
        state.isHomeLoading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchLogProductsThunk.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: productsProp[];
            pagination: {
              page: number | undefined;
              limit: number | undefined;
              total: number | undefined;
            };
          }>
        ) => {
          state.isHomeLoading = false;
          state.status = "succeeded";
          state.items = action.payload.data;

          const { page = 1, total = 0, limit = 20 } = action.payload.pagination || {};
          state.currentPage = page;
          state.totalRecords = total;
          state.totalPages = Math.ceil(total / limit);
        }
      )
      .addCase(fetchLogProductsThunk.rejected, (state, action) => {
        state.isHomeLoading = false;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchLogProductsByIdThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLogProductsByIdThunk.fulfilled, (state, action: PayloadAction<productsProp>) => {
        state.status = "succeeded";
        const payload = action.payload;
        const parsedItemList = Array.isArray(payload.item_list)
          ? payload.item_list
          : JSON.parse(payload.item_list || "[]");

        const sanitizedItemList = parsedItemList.map((item: any) => {
          if (item.gambar_path instanceof File) {
            return { ...item, gambar_path: item.gambar_path.name };
          }
          return item;
        });

        state.currentItem = {
          ...payload,
          item_list: sanitizedItemList,
          keterangan: payload.keterangan ?? "",
        };
      })
      .addCase(fetchLogProductsByIdThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createLogProductsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createLogProductsThunk.fulfilled, (state, { payload }) => {
        const parsedItemList = Array.isArray(payload.item_list)
          ? payload.item_list
          : JSON.parse(payload.item_list || "[]");

        const sanitizedItemList = parsedItemList.map((item: any) => {
          if (item.gambar_path instanceof File) {
            return { ...item, gambar_path: item.gambar_path.name };
          }
          return item;
        });

        state.items.unshift({
          ...payload,
          item_list: sanitizedItemList,
        });
        state.status = "succeeded";
        state.currentItem = initialState.currentItem;
      })
      .addCase(createLogProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(putLogProductsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(putLogProductsThunk.fulfilled, (state, { payload }) => {
        const parsedItemList = Array.isArray(payload.item_list)
          ? payload.item_list
          : JSON.parse(payload.item_list || "[]");

        const sanitizedItemList = parsedItemList.map((item: any) => {
          if (item.gambar_path instanceof File) {
            return { ...item, gambar_path: item.gambar_path.name };
          }
          return item;
        });

        state.items = state.items.map((item) =>
          item.record_id === payload.record_id
            ? {
                ...payload,
                item_list: sanitizedItemList,
              }
            : item
        );
        state.status = "succeeded";
      })
      .addCase(putLogProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteLogProductsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteLogProductsThunk.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((item) => item.record_id !== payload);
        state.status = "succeeded";
      })
      .addCase(deleteLogProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetproductsStatus, clearCurrentItem, updateCurrentItemField } = logProductsSlice.actions;
export default logProductsSlice.reducer;
