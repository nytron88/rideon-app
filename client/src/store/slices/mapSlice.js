import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

const initialState = {
  coordinates: {
    pickup: null,
    destination: null,
  },
  suggestions: [],
  distance: null,
  duration: null,
  loading: false,
  error: null,
};

export const getCoordinates = createAsyncThunk(
  "map/getCoordinates",
  async (address, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `maps/coordinates?address=${encodeURIComponent(address)}`
      );
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

export const getDistanceTime = createAsyncThunk(
  "map/getDistanceTime",
  async ({ origin, destination }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `maps/distance-time?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(destination)}`
      );
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

export const getLocationSuggestions = createAsyncThunk(
  "map/getLocationSuggestions",
  async (query, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `maps/suggestions?query=${encodeURIComponent(query)}`
      );
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setPickupCoordinates: (state, action) => {
      state.coordinates.pickup = action.payload;
    },
    setDestinationCoordinates: (state, action) => {
      state.coordinates.destination = action.payload;
    },
    clearCoordinates: (state) => {
      state.coordinates = initialState.coordinates;
      state.distance = null;
      state.duration = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Coordinates
      .addCase(getCoordinates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoordinates.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getCoordinates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Distance & Time
      .addCase(getDistanceTime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDistanceTime.fulfilled, (state, action) => {
        state.loading = false;
        state.distance = action.payload.distance;
        state.duration = action.payload.duration;
      })
      .addCase(getDistanceTime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Location Suggestions
      .addCase(getLocationSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLocationSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload;
      })
      .addCase(getLocationSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPickupCoordinates,
  setDestinationCoordinates,
  clearCoordinates,
  clearSuggestions,
} = mapSlice.actions;

export default mapSlice.reducer;
