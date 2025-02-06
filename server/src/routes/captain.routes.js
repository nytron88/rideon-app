import { Router } from "express";
import {
  google,
  logoutCaptain,
  refreshAccessToken,
  getCaptainProfile,
  registerCaptainVehicle,
} from "../controllers/captain.controller.js";
import verifyAuthBlockingToken from "../middlewares/firebase.middleware.js";
import verifyLogin from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/google", verifyAuthBlockingToken, google);
router.post("/logout", verifyLogin, logoutCaptain);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile", verifyLogin, getCaptainProfile);
router.post("/register-vehicle", verifyLogin, registerCaptainVehicle);

export default router;
