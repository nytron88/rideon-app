import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import client from "../services/redisService.js";

const requireCaptain = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "captain") {
    throw new ApiError(403, "You are not authorized to access this route");
  }

  next();
});

export default requireCaptain;
