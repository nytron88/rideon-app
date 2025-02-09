import { configureStore } from "@reduxjs/toolkit";
import { injectStore } from "../services/api";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});

injectStore(store);
