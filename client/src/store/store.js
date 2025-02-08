import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { injectStore } from "../services/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

injectStore(store);
