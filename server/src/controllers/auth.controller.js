import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Captain } from "../models/captain.model.js";
import client from "../services/redisService.js";
import jwt from "jsonwebtoken";

const getModel = (role) => {
  if (role === "user") return User;
  if (role === "captain") return Captain;
  throw new ApiError(400, "Invalid role specified");
};

const generateAccessAndRefreshToken = async (userId, role) => {
  try {
    const Model = getModel(role);
    const user = await Model.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    await client.set(
      `refreshToken:${role}:${userId}`,
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
  const { name: fullname, email, photo: avatar, role } = req.body;
  if (!email || !fullname || !avatar || !role) {
    throw new ApiError(400, "Missing required fields");
  }
  const otherModel = role === "user" ? Captain : User;

  const existingUser = await otherModel.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const Model = getModel(role);

  let user = await Model.findOne({ email });

  if (!user) {
    user = await Model.create({ fullname, email, avatar });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
    role
  );

  await client.set(`role:${user._id}`, role, "NX");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Success"));
});

const logout = asyncHandler(async (req, res) => {
  const role = await client.get(`role:${req.user._id}`);

  await client.del(`refreshToken:${role}:${req.user._id}`);
  await client.set(`blacklist:${req.cookies.accessToken}`, "", "EX", 30);

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

    const role = await client.get(`role:${decodedToken._id}`);

    if (!role) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const storedRefreshToken = await client.get(
      `refreshToken:${role}:${decodedToken._id}`
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
      await generateAccessAndRefreshToken(decodedToken._id, role);

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

const getUserProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User found"));
});

export { google, logout, refreshAccessToken, getUserProfile };
