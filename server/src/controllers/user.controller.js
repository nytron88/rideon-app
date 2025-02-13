import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import client from "../services/redisService.js";
import {
  createStripeAccount as createStripeAccountService,
  createAccountLinks,
} from "../services/stripeService.js";

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

  if (user.role === role) {
    throw new ApiError(400, `You are already a ${role}`);
  }

  if (role === "captain") {
    user.status = "inactive";
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  await client.del(`user:${user._id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Role updated successfully"));
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

  if (status === "active" && !user.stripeAccountId) {
    throw new ApiError(400, "Please create a stripe account first");
  }

  if (status === "active" && !user.vehicle) {
    throw new ApiError(400, "Please add vehicle details first");
  }

  user.status = status;
  await user.save();

  await client.del(`user:${user._id}`);

  return res.status(200).json(new ApiResponse(200, user, "Status updated"));
});

const createStripeAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.stripeAccountId) {
    throw new ApiError(400, "Stripe account already exists");
  }

  const account = await createStripeAccountService(user.email);

  user.stripeAccountId = account.id;

  await user.save({ validateBeforeSave: false });

  const accountLink = await createAccountLinks(account.id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, onboardingUrl: accountLink.url },
        "Stripe account created"
      )
    );
});

const registerVehicle = asyncHandler(async (req, res) => {
  const { color, plate, vehicleType, capacity } = req.body;

  if (!color || !plate || !vehicleType || !capacity) {
    throw new ApiError(400, "All fields are required");
  }

  const existingPlate = await User.findOne({ "vehicle.plate": plate });

  if (existingPlate) {
    throw new ApiError(400, "Vehicle with this plate number already exists");
  }

  const user = await User.findById(req.user._id);

  user.vehicle = { color, plate, vehicleType, capacity };

  await user.save();

  await client.del(`user:${user._id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Vehicle registered successfully"));
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.vehicle = undefined;
  user.status = "inactive";

  await user.save({ validateBeforeSave: false });

  await client.del(`user:${user._id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Vehicle deleted successfully"));
});

export {
  getUserProfile,
  addRole,
  updateStatus,
  createStripeAccount,
  registerVehicle,
  deleteVehicle,
};
