import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    photo: { type: String },
    socketId: { type: String },

    role: {
      type: String,
      enum: ["user", "captain"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: function () {
        return this.role === "captain" ? "inactive" : undefined;
      },
    },

    vehicle: {
      type: new mongoose.Schema(
        {
          color: { type: String, minlength: 3 },
          plate: { type: String, minlength: 3 },
          capacity: { type: Number, min: 1 },
          vehicleType: { type: String },
        },
        { _id: false }
      ),
      required: function () {
        return this.role === "captain";
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullname: this.fullname,
      email: this.email,
      role: this.role,
      ...(this.role === "captain" && { status: this.status }),
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
