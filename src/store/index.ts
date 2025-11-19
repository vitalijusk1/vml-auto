import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import dataSlice from "./slices/dataSlice";
import filtersSlice from "./slices/filtersSlice";
import uiSlice from "./slices/uiSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["ui"], // Only persist UI state (sidebarCollapsed, currentView, orderControlSelectedCarId)
  // Filters are handled per-page with sessionStorage (resets when tab closes)
};

const rootReducer = combineReducers({
  data: dataSlice,
  filters: filtersSlice,
  ui: uiSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore Date objects in state (they will be serialized by redux-persist if needed)
        ignoredPaths: ["data.parts", "data.orders", "data.returns"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
