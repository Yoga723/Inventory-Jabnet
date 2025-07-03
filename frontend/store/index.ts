import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import themeReducer from "./themeSlice";
import productslogReducer from "./inventory/logProductsSlice";
import inventoryReducer from "./inventory/inventorySlice";
import customersReducer from "./customers/customersSlice";
import customerPaketSlice from "./customers/paketSlice";
import filterCustomerSlice from "./customers/filterCustomerSlice";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

// 1. Gabungkan semua slice
const rootReducer = combineReducers({
  productsLog: productslogReducer,
  user: userReducer,
  theme: themeReducer,
  inventory: inventoryReducer,
  customers: customersReducer,
  filterCustomers: filterCustomerSlice,
  customerPaket: customerPaketSlice,
});

// 2. Buat konfigurasi persist hanya untuk slice 'user'
const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "theme"], // slice user anu dipersist
};

// 3. Bungkus userReducer dengan persistReducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

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
