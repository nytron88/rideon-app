import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  isConnected: false,
  socket: null,
  error: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      if (action.payload) {
        toast.error(action.payload?.message);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setSocket, setConnected, setError, clearError } =
  socketSlice.actions;
export default socketSlice.reducer;
