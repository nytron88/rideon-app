import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import client from "../services/redisService.js";

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
  const { name: fullname, email, photo: avatar } = req.user;
  const { role } = req.body;

  if (!email || !fullname || !avatar || !role) {
    throw new ApiError(400, "Missing required fields");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullname,
      email,
      avatar,
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
    User
  );

  res
    .status(200)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Success"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await client.del(`refreshToken:${req.user._id}`);

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

  const { role } = req.body;

  if (!role) {
    throw new ApiError(400, "Role is required");
  }

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
      await generateAccessAndRefreshToken(decodedToken._id, User);

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

export { google, logoutUser, refreshAccessToken, getUserProfile };
