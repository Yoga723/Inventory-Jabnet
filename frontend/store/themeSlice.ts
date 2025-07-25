import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: "dark",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
