import auth from "../services/firebaseAdmin.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const verifyAuthBlockingToken = asyncHandler(async (req, _, next) => {
  const idToken = req.header("Authorization")?.replace("Bearer ", "");

  if (!idToken) {
    throw new ApiError(401, "Invalid or expired token");
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      photo: decodedToken.picture,
    };
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});

export default verifyAuthBlockingToken;
