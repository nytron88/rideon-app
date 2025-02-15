import axios from "axios";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import client from "../services/redis.service.js";

export const getAddressCoordinate = async (address) => {
  if (!address) {
    throw new ApiError(400, "Address is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
      };
    } else {
      throw new ApiError(400, "Unable to fetch location");
    }
  } catch (error) {
    console.error("Error in getAddressCoordinate:", error);
    throw new ApiError(400, error?.message || "Unable to fetch location");
  }
};

export const getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new ApiError(400, "Origin and destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(
    destination
  )}&units=imperial&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const element = response.data.rows[0].elements[0];

      if (element.status === "ZERO_RESULTS") {
        throw new ApiError(400, "No routes found between these locations");
      }

      return {
        distance: parseFloat(element.distance.text.replace(" mi", "")),
        duration: Math.ceil(element.duration.value / 60),
        raw: element,
      };
    } else {
      throw new ApiError(400, "Unable to calculate distance and time");
    }
  } catch (error) {
    console.error("Error in getDistanceTime:", error);
    throw new ApiError(
      400,
      error?.message || "Failed to get route information"
    );
  }
};

export const getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new ApiError(400, "Search query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      return response.data.predictions
        .map((prediction) => prediction.description)
        .filter(Boolean);
    } else {
      throw new ApiError(400, "Unable to fetch location suggestions");
    }
  } catch (error) {
    console.error("Error in getAutoCompleteSuggestions:", error);
    throw new ApiError(
      400,
      error?.message || "Failed to get location suggestions"
    );
  }
};

export const updateCaptainLocation = async (captainId, ltd, lng) => {
  try {
    await client.geoadd("captain:locations", lng, ltd, captainId);
    await client.expire("captain:locations", 300);
    return true;
  } catch (error) {
    console.error("Error updating captain location:", error);
    throw new ApiError(500, "Failed to update captain location");
  }
};

export const getCaptainsInTheRadius = async (ltd, lng, radius = 3) => {
  if (!ltd || !lng) {
    throw new ApiError(400, "Coordinates are required");
  }

  try {
    const nearbyLocations = await client.georadius(
      "captain:locations",
      lng,
      ltd,
      radius * 1609.34,
      "m",
      "WITHCOORD"
    );

    if (!nearbyLocations.length) {
      return [];
    }

    const captainIds = nearbyLocations.map((location) => location[0]);

    const captains = await User.find({
      _id: { $in: captainIds },
      role: "captain",
      status: "active",
    }).select("fullname photo vehicle");

    return captains
      .map((captain) => {
        const locationData = nearbyLocations.find(
          (loc) => loc[0] === captain._id.toString()
        );

        if (!locationData) return null;

        return {
          ...captain.toObject(),
          location: {
            type: "Point",
            coordinates: [
              parseFloat(locationData[1][0]),
              parseFloat(locationData[1][1]),
            ],
          },
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error in getCaptainsInTheRadius:", error);
    throw new ApiError(500, "Failed to fetch nearby captains");
  }
};
