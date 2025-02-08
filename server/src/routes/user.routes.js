import { Router } from "express";
import verifyLogin from "../middlewares/auth.middleware.js";
import {
  getUserProfile,
  addRole,
  updateStatus,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/profile", verifyLogin, getUserProfile);
router.put("/role", verifyLogin, addRole);
router.put("/status", verifyLogin, updateStatus);

export default router;
