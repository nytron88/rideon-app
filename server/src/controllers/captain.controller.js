import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Captain } from "../models/captain.model.js";
import client from "../services/redisService.js";

const generateAccessAndRefreshToken = async (captainId) => {
  try {
    const captain = await Captain.findById(captainId);
    if (!captain) throw new ApiError(404, "Captain not found");

    const refreshToken = captain.generateRefreshToken();
    const accessToken = captain.generateAccessToken();

    await client.set(
      `refreshToken:${captainId}`,
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

  let captain = await Captain.findOne({ email });

  if (!captain) {
    captain = await Captain.create({
      fullname,
      email,
      avatar,
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    captain._id,
    Captain
  );

  res
    .status(200)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "Success"));
});

const logoutCaptain = asyncHandler(async (req, res) => {
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
    .json(new ApiResponse(200, {}, "Captain logged out successfully"));
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
      await generateAccessAndRefreshToken(decodedToken._id, Captain);

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

const getCaptainProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User found"));
});

const registerCaptainVehicle = asyncHandler(async (req, res) => {
  const { vehicle } = req.body;

  if (
    !vehicle ||
    typeof vehicle !== "object" ||
    !vehicle.color ||
    !vehicle.plate ||
    !vehicle.capacity ||
    !vehicle.vehicleType
  ) {
    throw new ApiError(400, "Missing or invalid vehicle fields");
  }

  const captain = await Captain.findById(req.user._id);

  if (!captain) {
    throw new ApiError(404, "Captain not found");
  }

  if (
    vehicle.color.length < 3 ||
    vehicle.plate.length < 3 ||
    vehicle.capacity < 1
  ) {
    throw new ApiError(400, "Vehicle details do not meet validation rules");
  }

  captain.vehicle = vehicle;

  await captain.save();

  return res
    .status(200)
    .json(new ApiResponse(200, captain, "Vehicle registered successfully"));
});

export {
  google,
  logoutCaptain,
  refreshAccessToken,
  getCaptainProfile,
  registerCaptainVehicle,
};
