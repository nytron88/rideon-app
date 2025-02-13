import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import client from "../services/redisService.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    await client.set(
      `refreshToken:${userId}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const google = asyncHandler(async (req, res) => {
  const { uid, name: fullname, email, photo } = req.user;

  if (!uid || !email || !fullname || !photo) {
    throw new ApiError(400, "Missing required fields");
  }

  let user = await User.findOne({ uid });

  if (!user) {
    user = await User.create({ uid, fullname, email, photo, role: "user" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Success"));
});

const logout = asyncHandler(async (req, res) => {
  await client.del(`refreshToken:${req.user?._id}`);
  await client.del(`user:${req.user?._id}`);
  await client.set(`blacklist:${req.cookies?.accessToken}`, "", "EX", 30);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const storedRefreshToken = await client.get(
      `refreshToken:${decodedToken._id}`
    );

    if (!storedRefreshToken || storedRefreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(decodedToken._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { google, logout, refreshAccessToken };
