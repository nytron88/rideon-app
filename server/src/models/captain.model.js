import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const captainSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  avatar: {
    type: String,
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  vehicle: {
    type: new mongoose.Schema(
      {
        color: {
          type: String,
          required: function () {
            return this.vehicle != null;
          },
          minlength: [3, "Color must be at least 3 characters long"],
        },
        plate: {
          type: String,
          required: function () {
            return this.vehicle != null;
          },
          minlength: [3, "Plate must be at least 3 characters long"],
        },
        capacity: {
          type: Number,
          required: function () {
            return this.vehicle != null;
          },
          min: [1, "Capacity must be at least 1"],
        },
        vehicleType: {
          type: String,
          required: function () {
            return this.vehicle != null;
          },
        },
      },
      { _id: false }
    ),
    required: false,
  },
});

captainSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullname: this.fullname,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

captainSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const Captain = mongoose.model("Captain", captainSchema);
