<<<<<<< HEAD
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import recordsReducer from "./recordSlice";
import userReducer from "./userSlice";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

// 1. Gabungkan semua slice
const rootReducer = combineReducers({
  records: recordsReducer,
  user: userReducer,
});

// 2. Buat konfigurasi persist hanya untuk slice 'user'
const persistConfig = {
  key: "user",
  storage,
  whitelist: ["user"], // slice user anu dipersist
};

// 3. Bungkus userReducer dengan persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Buat store dan atur middleware agar mendukung redux-persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // abaikan aksi-aksi internal redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 5. Buat persistor
export const persistor = persistStore(store);

// 6. Export tipe untuk hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
=======
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import recordsReducer from "./recordSlice";
import userReducer from "./userSlice";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

// 1. Gabungkan semua slice
const rootReducer = combineReducers({
  records: recordsReducer,
  user: userReducer,
});

// 2. Buat konfigurasi persist hanya untuk slice 'user'
const persistConfig = {
  key: "user",
  storage,
  whitelist: ["user"], // slice user anu dipersist
};

// 3. Bungkus userReducer dengan persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Buat store dan atur middleware agar mendukung redux-persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // abaikan aksi-aksi internal redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 5. Buat persistor
export const persistor = persistStore(store);

// 6. Export tipe untuk hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
>>>>>>> 4289c65a (change name placeholder)
