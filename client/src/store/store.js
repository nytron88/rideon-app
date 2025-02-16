import { configureStore } from "@reduxjs/toolkit";
import { injectStore } from "../services/api";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import rideReducer from "./slices/rideSlice";
import mapReducer from "./slices/mapSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ride: rideReducer,
    map: mapReducer,
  },
});

injectStore(store);
