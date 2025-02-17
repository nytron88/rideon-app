import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api.service";

const initialState = {
  currentRide: null,
  fare: null,
  loading: false,
  error: null,
};

export const createRide = createAsyncThunk(
  "ride/createRide",
  async (rideData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("ride", rideData);
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

export const updateRideStatus = createAsyncThunk(
  "ride/updateStatus",
  async ({ rideId, status, otp }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`ride/${rideId}/status`, {
        status,
        otp,
      });
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  "ride/createPaymentIntent",
  async ({ amount, captainId, rideId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("ride/create-payment-intent", {
        amount,
        captainId,
        rideId,
      });
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

export const getFare = createAsyncThunk(
  "ride/getFare",
  async ({ pickup, destination }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("ride/fare", {
        params: { pickup, destination },
      });
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Unable to calculate fare. Please try again.");
    }
  }
);

const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    clearCurrentRide: (state) => {
      state.currentRide = null;
    },
    setCurrentRide: (state, action) => {
      state.currentRide = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Ride
      .addCase(createRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(createRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create ride";
      })
      // Update Ride Status
      .addCase(updateRideStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRideStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(updateRideStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Fare
      .addCase(getFare.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fare = null;
      })
      .addCase(getFare.fulfilled, (state, action) => {
        state.loading = false;
        state.fare = action.payload;
      })
      .addCase(getFare.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fare = null;
      });
  },
});

export const { clearCurrentRide, setCurrentRide } = rideSlice.actions;
export default rideSlice.reducer;
