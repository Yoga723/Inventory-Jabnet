import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { removeLocalStorageItem, setLocalStorageItem, StorageKeys } from "app/utils/localStorage";
import { UserState } from "types";

const initialState: UserState = {
  user_id: null,
  username: null,
  full_name: null,
  role: null,
  status: "idle",
  token: null, // Changed from "" to null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, "status">>) {
      state.user_id = action.payload.user_id;
      state.username = action.payload.username;
      state.full_name = action.payload.full_name;
      state.role = action.payload.role;
      state.token = action.payload.token; // Store token
      state.status = "succeeded";
      if (action.payload.token) {
        setLocalStorageItem(StorageKeys.AUTH_TOKEN, action.payload.token);
      }
    },
    logout(state) {
      removeLocalStorageItem(StorageKeys.AUTH_TOKEN);
      Object.assign(state, initialState, { status: "idle" });
    },
    clearUser(state) {
      Object.assign(state, initialState);
      removeLocalStorageItem(StorageKeys.AUTH_TOKEN);
      return state;
    },
  },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;