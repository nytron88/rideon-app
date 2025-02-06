import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/users/register", data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

const authSlice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(googleAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(googleAuth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
