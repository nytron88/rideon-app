import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAddressCoordinate,
  getDistanceTime as getDistanceTimeService,
  getAutoCompleteSuggestions as getAutoCompleteSuggestionsService,
} from "../services/maps.service.js";
import { validationResult } from "express-validator";

const getCoordinates = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(400, { errors: errors.array() }, "Validation failed");
  }

  const { address } = req.query;

  if (!address) {
    throw new ApiError(400, "Address is required");
  }

  const coordinates = await getAddressCoordinate(address);

  if (!coordinates) {
    throw new ApiError(404, "Coordinates not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, coordinates, "Coordinates fetched successfully")
    );
});

const getDistanceTime = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(400, { errors: errors.array() }, "Validation failed");
  }

  const { origin, destination } = req.query;

  if (!origin || !destination) {
    throw new ApiError(400, "Origin and destination are required");
  }

  const data = await getDistanceTimeService(origin, destination);

  if (!data) {
    throw new ApiError(404, "Distance and time not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Distance and time fetched successfully"));
});

const getAutoCompleteSuggestions = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Query is required");
  }

  const suggestions = await getAutoCompleteSuggestionsService(query);

  if (!suggestions) {
    throw new ApiError(404, "Suggestions not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        suggestions,
        "Auto complete suggestions fetched successfully"
      )
    );
});

export { getCoordinates, getDistanceTime, getAutoCompleteSuggestions };
