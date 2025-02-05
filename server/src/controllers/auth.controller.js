import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Captain } from "../models/captain.model.js";

const generateAccessAndRefreshToken = async (userId, model) => {
  try {
    const user = await model.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const google = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, avatar } = req.user;
  const { role } = req.body;

  let model = role === "captain" ? Captain : User;

  let user = await model.findOne({ email });

  if (!user) {
    user = await model.create({
      fullname: { firstname, lastname },
      email,
      avatar,
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
    model
  );

  res
    .status(200)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Success"));
});

const logoutUser = asyncHandler(async (req, res) => {});

const refreshToken = asyncHandler(async (req, res) => {});

export { google, logoutUser, refreshToken };
