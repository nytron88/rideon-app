import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Ride } from "../models/ride.model.js";
import client from "../services/redisService.js";
import { createPaymentIntent as createPaymentIntentService } from "../services/stripeService.js";

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, captainId, pickup, destination, duration, distance } =
    req.body;
  const rider = req.user;

  if (
    !amount ||
    !captainId ||
    !pickup ||
    !destination ||
    !duration ||
    !distance
  ) {
    throw new ApiError(400, "Amount and captainId are required");
  }

  const captain = await User.findById(captainId);

  if (!captain || captain.role !== "captain") {
    throw new ApiError(404, "Captain not found");
  }

  if (!captain.stripeAccountId) {
    throw new ApiError(400, "Captain has not setup payment account");
  }

  const paymentIntent = await createPaymentIntentService(
    amount,
    captain.stripeAccountId
  );

  const ride = new Ride({
    user: rider._id,
    captain: captain._id,
    pickup,
    destination,
    fare: amount,
    duration,
    distance,
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
  });

  await ride.save();

  await client.set(`ride:${ride._id}`, JSON.stringify(ride), "EX", 86400);

  return res
    .status(201)
    .json(
      new ApiResponse(200, paymentIntent, "Payment intent created successfully")
    );
});

export { createPaymentIntent };
