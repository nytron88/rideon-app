import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api.service";
import { toast } from "react-toastify";

const initialState = {
  currentRide: null,
  fare: null,
  loading: false,
  error: null,
  newRideRequest: null,
};

export const createRide = createAsyncThunk(
  "ride/createRide",
  async (rideData, { getState, rejectWithValue }) => {
    try {
      const { ride } = getState();

      if (ride?.fare) {
        rideData = {
          ...rideData,
          fare: ride.fare.fare,
          distance: ride.fare.distance,
          duration: ride.fare.duration,
        };
      }

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

export const fetchCurrentRide = createAsyncThunk(
  "ride/fetchCurrentRide",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("ride");
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Failed to fetch current ride");
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
    setNewRideRequest: (state, action) => {
      state.newRideRequest = action.payload;
    },
    clearNewRideRequest: (state) => {
      state.newRideRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRide.fulfilled, (state) => {
        state.loading = false;
        state.fare = null;
      })
      .addCase(createRide.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload?.message || "Failed to create ride";
        state.error = errorMessage;
        toast.error(errorMessage);
      })
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
        const errorMessage =
          action.payload?.message || "Failed to update ride status";
        state.error = errorMessage;
        toast.error(errorMessage);
      })
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
        const errorMessage = action.payload?.message || "Payment failed";
        state.error = errorMessage;
        toast.error(errorMessage);
      })
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
        const errorMessage =
          action.payload?.message || "Unable to calculate fare";
        state.error = errorMessage;
        state.fare = null;
        toast.error(errorMessage);
      })
      .addCase(fetchCurrentRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(fetchCurrentRide.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const {
  clearCurrentRide,
  setCurrentRide,
  setNewRideRequest,
  clearNewRideRequest,
} = rideSlice.actions;
export default rideSlice.reducer;
