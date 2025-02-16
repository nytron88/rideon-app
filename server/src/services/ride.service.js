import { Ride } from "../models/ride.model.js";
import { getDistanceTime } from "./maps.service.js";
import ApiError from "../utils/ApiError.js";
import client from "../services/redis.service.js";
import crypto from "crypto";
import { BASE_FARE, PER_MILE_RATE, PER_MINUTE_RATE } from "../constants.js";

export const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new ApiError(400, "Both pickup and destination are required");
  }

  const distanceTime = await getDistanceTime(pickup, destination);

  const fare = Math.round(
    BASE_FARE +
      distanceTime.distance * PER_MILE_RATE +
      distanceTime.duration * PER_MINUTE_RATE
  );

  return { fare, ...distanceTime };
};

export const createRide = async ({
  user,
  pickup,
  destination,
  fare,
  duration,
  distance,
}) => {
  if (!user || !pickup || !destination || !fare || !duration || !distance) {
    throw new ApiError(400, "Missing required ride details");
  }

  try {
    const ride = await Ride.create({
      user,
      pickup,
      destination,
      fare,
      duration,
      distance,
      otp: crypto.randomInt(1000, 9999).toString(),
      status: "pending",
    });

    await client.setex(`ride:${ride._id}`, 86400, JSON.stringify(ride));
    return ride;
  } catch (error) {
    throw new ApiError(500, "Failed to create ride");
  }
};

export const updateRideStatus = async (rideId, status, otp = null) => {
  if (!rideId || !status) {
    throw new ApiError(400, "Ride ID and status are required");
  }

  try {
    const ride = await Ride.findById(rideId)
      .populate("user", "fullname photo")
      .populate("captain", "fullname photo vehicle")
      .select("+otp");

    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (status === "ongoing") {
      if (ride.status !== "accepted") {
        throw new ApiError(400, "Ride must be accepted before starting");
      }
      if (!otp || ride.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
      }
    }

    const validTransitions = {
      pending: ["accepted"],
      accepted: ["ongoing"],
      ongoing: ["completed"],
    };

    if (!validTransitions[ride.status]?.includes(status)) {
      throw new ApiError(400, "Invalid status transition");
    }

    ride.status = status;
    await ride.save({ validateBeforeSave: false });

    await client.setex(`ride:${ride._id}`, 86400, JSON.stringify(ride));
    return ride;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to update ride status");
  }
};

export const updateRidePayment = async (rideId, stripePaymentIntentId) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    ride.stripePaymentIntentId = stripePaymentIntentId;
    await ride.save();

    await client.setex(`ride:${ride._id}`, 86400, JSON.stringify(ride));
    return ride;
  } catch (error) {
    throw new ApiError(500, "Failed to update ride payment details");
  }
};
