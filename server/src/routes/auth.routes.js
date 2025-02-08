import { Router } from "express";
import {
  google,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
} from "../controllers/auth.controller.js";
import verifyAuthBlockingToken from "../middlewares/firebase.middleware.js";
import verifyLogin from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/google", verifyAuthBlockingToken, google);
router.post("/logout", verifyLogin, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile", verifyLogin, getUserProfile);

export default router;
