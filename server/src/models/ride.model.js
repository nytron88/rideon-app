import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    passengers: {
      type: Number,
      required: true,
      min: [1, "Minimum 1 passenger required"],
      max: [4, "Maximum 4 passengers allowed"],
      validate: {
        validator: Number.isInteger,
        message: "Passenger count must be a whole number",
      },
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed"],
      default: "pending",
    },
    duration: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
      required: true,
    },
  },
  { timestamps: true }
);

export const Ride = mongoose.model("Ride", rideSchema);
