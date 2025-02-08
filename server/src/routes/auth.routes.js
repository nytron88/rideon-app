import { Router } from "express";
import {
  google,
  logout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import verifyAuthBlockingToken from "../middlewares/firebase.middleware.js";
import verifyLogin from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/google", verifyAuthBlockingToken, google);
router.post("/logout", verifyLogin, logout);
router.post("/refresh-token", refreshAccessToken);

export default router;
