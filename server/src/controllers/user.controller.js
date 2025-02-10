import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import client from "../services/redisService.js";

const getUserProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User found"));
});

const addRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["user", "captain"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "captain") {
    throw new ApiError(400, "You are already a captain");
  }

  if (role === "captain") {
    user.status = "inactive";
  }

  user.role = role;
  await user.save();

  await client.del(`user:${user._id}`);

  res.json(new ApiResponse(200, user, "Role updated successfully"));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== "captain") {
    throw new ApiError(403, "Only captains can change their status");
  }

  if (!user.vehicle) {
    throw new ApiError(400, "Please add vehicle details first");
  }

  user.status = status;
  await user.save();

  await client.del(`user:${user._id}`);

  res.json(new ApiResponse(200, user, "Status updated"));
});

export { getUserProfile, addRole, updateStatus };
