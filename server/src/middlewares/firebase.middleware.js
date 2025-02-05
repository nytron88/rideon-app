import auth from "../services/firebaseAdminService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const verifyAuthBlockingToken = asyncHandler(async (req, res, next) => {
  const idToken = req.header("Authorization")?.replace("Bearer ", "");

  if (!idToken) {
    throw new ApiError(401, "Invalid or expired token");
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});

export default verifyAuthBlockingToken;
