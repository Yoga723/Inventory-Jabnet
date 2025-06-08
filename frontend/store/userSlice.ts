import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { removeLocalStorageItem, setLocalStorageItem, StorageKeys } from "app/utils/localStorage";
import { UserState } from "types";

const initialState: UserState = {
  user_id: null,
  username: null,
  full_name: null,
  role: null,
  status: "idle",
  token: "",
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
      state.status = "succeeded";
    },
    clearUser(state) {
      Object.assign(state, initialState);
      removeLocalStorageItem(StorageKeys.USERSTATE);
      return state;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
