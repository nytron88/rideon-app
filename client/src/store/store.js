import { configureStore } from "@reduxjs/toolkit";
import { injectStore } from "../services/api.service";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import rideReducer from "./slices/rideSlice";
import mapReducer from "./slices/mapSlice";
import socketReducer from "./slices/socketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ride: rideReducer,
    map: mapReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["socket/setSocket"],
        ignoredPaths: ["socket.socket"],
      },
    }),
});

injectStore(store);
