// store/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { removeLocalStorageItem, setLocalStorageItem, StorageKeys } from "app/utils/localStorage";
import { UserState } from "types";

const API_BASE_URL = "https://inventory.jabnet.id/api/user";

const initialState: UserState = {
  user_id: null,
  username: null,
  full_name: null,
  role: null,
  token: null,
  status: "idle",
};

// Thunk untuk login
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });
    const data = await response.json();
    return data.data; // { token, user: { ... } }
  }
);

export const logout = createAsyncThunk("user/logout", async (tedipake, { dispatch }) => {
  // await persistor.purge();
  dispatch(clearUser());
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser(state) {
      state = initialState;
      removeLocalStorageItem(StorageKeys.USERSTATE);
      document.cookie = [
        `auth_token=`,
        `Path=/`,
        `Max-Age=0`, // expire immediately
        `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        `SameSite=Lax`,
        `Secure`,
      ].join("; ");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: any }>) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user_id = action.payload.user.user_id;
        state.username = action.payload.user.username;
        state.full_name = action.payload.user.full_name;
        state.role = action.payload.user.role;
        // Simpan ke localStorage
        setLocalStorageItem(StorageKeys.USERSTATE, JSON.stringify(state));
      })
      .addCase(loginUser.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
