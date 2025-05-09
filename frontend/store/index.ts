import { configureStore } from "@reduxjs/toolkit";
import recordsReducer from "./recordSlice";

export const store = configureStore({ reducer: { records: recordsReducer } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
