import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Item, Kategori } from "types";
const API_BASE_URL = "https://inventory.jabnet.id/api/records";

interface InventoryState {
  categories: Kategori[];
  items: Item[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: InventoryState = {
  categories: [],
  items: [],
  status: "idle",
  error: null,
};

// Async Thunk
export const fetchCategories = createAsyncThunk("inventory/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/kategori`, { method: "GET", credentials: "include" });

    if (!response) throw new Error("Gagal fetch kategori");

    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchItem = createAsyncThunk("inventory/fetchItem", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/item`, { method: "GET", credentials: "include" });

    if (!response) throw new Error("Gagal fetch item");

    const data = await response.json();

    return data.map((item: Item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      kategori_id: item.kategori_id,
      nama_kategori: item.nama_kategori,
      created_at: item.created_at,
    }));
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createItem = createAsyncThunk(
  "inventory/createItem",
  async (item: { item_name: string; kategori_id: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create item");

      const data = await response.json();

      return {
        ...data,
        nama_kategori: "New Item, Please Refresh",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItem = createAsyncThunk(
  "inventory/updateItem",
  async ({ id, item }: { id: number; item: { item_name: string; kategori_id: number } }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/item/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update item");
      const { data } = await response.json();

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItem = createAsyncThunk("inventory/deleteItem", async (id: number, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/item/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      // Fetch Kategori
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Kategori[]>) => {
        state.categories = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      //   Fetch Item
      .addCase(fetchItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchItem.fulfilled, (state, action: PayloadAction<Item[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      }) // Create Item
      .addCase(createItem.fulfilled, (state, action) => {
        state.items.push(action.payload.data);
      })
      // Update Item
      .addCase(updateItem.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((i) => i.item_id === updated.item_id);
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            item_name: updated.item_name,
            kategori_id: updated.kategori_id,
            created_at: updated.created_at,
          };
        }
      })
      // Delete Item
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.item_id !== action.payload);
      });
  },
});

export default inventorySlice.reducer;
