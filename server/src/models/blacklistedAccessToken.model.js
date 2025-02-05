import mongoose from "mongoose";

const blacklistedAccessTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
    expires: 1800,
  },
});

export const BlacklistedAccessToken = mongoose.model("BlacklistedAccessToken", blacklistedAccessTokenSchema);
