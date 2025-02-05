import { Router } from "express";
import {
  google,
  logoutUser,
  refreshToken,
} from "../controllers/auth.controller.js";
import verifyAuthBlockingToken from "../middlewares/firebase.middleware.js";
import verifyLogin from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/google", verifyAuthBlockingToken, google);
router.post("/logout", verifyLogin, logoutUser);
router.post("/refresh-token", refreshToken);

export default router;
