import { Router } from "express";
import verifyLogin from "../middlewares/auth.middleware.js";
import {
  getUserProfile,
  addRole,
  updateStatus,
} from "../controllers/user.controller.js";

const router = Router();

router.use(verifyLogin);

router.get("/profile", getUserProfile);
router.put("/role", addRole);
router.put("/status", updateStatus);

export default router;
