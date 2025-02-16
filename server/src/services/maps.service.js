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
    }

    throw new ApiError(400, "Location not found");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Unable to find this location");
  }
};

export const getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new ApiError(
      400,
      "Both pickup and destination locations are required"
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(
    destination
  )}&units=imperial&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.data.status !== "OK") {
      throw new ApiError(400, "Please check your location details");
    }

    const element = response.data.rows?.[0]?.elements?.[0];
    if (!element) {
      throw new ApiError(400, "No route found between these locations");
    }

    if (element.status !== "OK") {
      const errorMessages = {
        NOT_FOUND: "We couldn't find one or both locations",
        ZERO_RESULTS: "No driving route available between these locations",
        MAX_ROUTE_LENGTH_EXCEEDED: "This route is too long",
        INVALID_REQUEST: "Please check your location details",
      };
      throw new ApiError(
        400,
        errorMessages[element.status] || "No route available"
      );
    }

    if (!element.distance?.text || !element.duration?.value) {
      throw new ApiError(400, "Route details unavailable");
    }

    const distanceText = element.distance.text;
    let distance;

    if (distanceText.includes("mi")) {
      distance = parseFloat(distanceText.replace(/[^0-9.]/g, ""));
    } else if (distanceText.includes("ft")) {
      distance = parseFloat(distanceText.replace(/[^0-9.]/g, "")) / 5280;
    } else {
      throw new ApiError(400, "Invalid distance format received");
    }

    return {
      distance: Number(distance.toFixed(2)),
      duration: Math.ceil(element.duration.value / 60),
      raw: element,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Unable to calculate route");
  }
};

export const getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new ApiError(400, "Please enter a location to search");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.data.status === "OK") {
      return response.data.predictions.map((prediction) => ({
        description: prediction.description,
        placeId: prediction.place_id,
      }));
    }

    throw new ApiError(400, "No locations found");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Unable to get location suggestions");
  }
};

export const updateCaptainLocation = async (captainId, ltd, lng) => {
  try {
    await client.geoadd("captain:locations", lng, ltd, captainId);
    await client.expire("captain:locations", 300);
    return true;
  } catch (error) {
    throw new ApiError(500, "Unable to update location");
  }
};

export const getCaptainsInTheRadius = async (ltd, lng, radius = 3) => {
  if (!ltd || !lng) {
    throw new ApiError(400, "Location coordinates required");
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

    if (!nearbyLocations.length) return [];

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
    throw new ApiError(500, "Unable to find nearby drivers");
  }
};
