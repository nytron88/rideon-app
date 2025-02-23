import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Ride } from "../models/ride.model.js";
import {
  createRide as createRideService,
  getFare as getFareService,
  updateRidePayment,
} from "../services/ride.service.js";
import { getAddressCoordinate } from "../services/maps.service.js";
import { createPaymentIntent as createPaymentIntentService } from "../services/stripe.service.js";
import { notifyNearbyCaptains } from "../socket.js";

const createRide = asyncHandler(async (req, res) => {
  const { pickup, destination, passengers, fare, distance, duration } =
    req.body;

  if (!pickup || !destination || !fare || !distance || !duration) {
    throw new ApiError(400, "All ride details are required");
  }

  if (!fare || !distance || !duration) {
    const fareResponse = await getFareService(pickup, destination);

    fare = fareResponse.fare;
    distance = fareResponse.distance;
    duration = fareResponse.duration;
  }

  const pickupCoords = await getAddressCoordinate(pickup);

  const ride = await createRideService({
    user: req.user._id,
    pickup,
    destination,
    passengers,
    fare,
    duration,
    distance,
  });

  await notifyNearbyCaptains(ride, pickupCoords);

  return res
    .status(201)
    .json(new ApiResponse(201, ride, "Ride created successfully"));
});

const getFare = asyncHandler(async (req, res) => {
  const { pickup, destination } = req.query;

  if (!pickup || !destination) {
    throw new ApiError(400, "Pickup and destination are required");
  }

  const fare = await getFareService(pickup, destination);

  if (!fare) {
    throw new ApiError(404, "Fare not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, fare, "Fare fetched successfully"));
});

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, captainId, rideId } = req.body;

  if (!amount || !captainId || !rideId) {
    throw new ApiError(400, "Amount, captainId, and rideId are required");
  }

  const captain = await User.findById(captainId);

  if (!captain) {
    throw new ApiError(404, "Captain not found");
  }

  if (!captain.stripeAccountId) {
    throw new ApiError(400, "Captain has not setup payment account");
  }

  const paymentIntent = await createPaymentIntentService(
    amount,
    captain.stripeAccountId
  );

  if (!paymentIntent) {
    throw new ApiError(500, "Failed to create payment intent");
  }

  const ride = await updateRidePayment(rideId, paymentIntent.id);

  return res
    .status(201)
    .json(new ApiResponse(200, ride, "Payment intent created successfully"));
});

const fetchCurrentRide = asyncHandler(async (req, res) => {
  const isCaptain = req.user.role === "captain";
  const filter = isCaptain ? { captain: req.user._id } : { user: req.user._id };

  const ride = await Ride.findOne({
    ...filter,
    status: { $in: ["accepted", "ongoing"] },
  }).populate(isCaptain ? "user" : "captain", `fullname photo ${isCaptain ? "" : "vehicle"}`);

  if (!ride) {
    throw new ApiError(404, "No ride found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, ride, "Ride fetched successfully"));
});

export { createRide, getFare, createPaymentIntent, fetchCurrentRide };
