import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import client from "../services/redisService.js";

const CACHE_EXPIRY = 1800;

const verifyLogin = asyncHandler(async (req, _, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const isBlacklisted = await client.get(`blacklist:${accessToken}`);

    if (isBlacklisted) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const userId = decodedToken?._id;

    if (!userId) {
      throw new ApiError(401, "Invalid access token");
    }

    const cacheKey = `user:${userId}`;

    let user = await client.get(cacheKey);

    if (user) {
      req.user = JSON.parse(user);
    } else {
      user = await User.findById(userId).select("-refreshToken");

      if (!user) {
        throw new ApiError(401, {
          message: "Invalid access token",
          invalid_access_token: true,
        });
      }

      await client.setex(cacheKey, CACHE_EXPIRY, JSON.stringify(user));
      req.user = user;
    }

    next();
  } catch (error) {
    throw new ApiError(
      401,
      error.message?.message || {
        message: "Invalid access token",
        invalid_access_token: true,
      }
    );
  }
});

export default verifyLogin;
