import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setUser } from "./userSlice";
import apiClient from "../../services/api";

const initialState = {
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (data, { dispatch, rejectWithValue }) => {
    const { idToken, ...filteredData } = data;
    try {
      const response = await apiClient.post("/auth/google", filteredData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      dispatch(setUser(response.data.data.user));
      return response.data.data.user;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.post("/auth/logout");
      dispatch(setUser(null));
      return null;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post("/auth/refresh-token");
      return null;
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
    logUser: (state) => {
      state.isAuthenticated = true;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logUser, setLoading, resetError } = authSlice.actions;
export default authSlice.reducer;
