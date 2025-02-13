import { Router } from "express";
import verifyLogin from "../middlewares/auth.middleware.js";
import requireCaptain from "../middlewares/requireCaptain.middleware.js";
import {
  getUserProfile,
  addRole,
  updateStatus,
  createStripeAccount,
  registerVehicle,
  deleteVehicle,
} from "../controllers/user.controller.js";

const router = Router();

router.use(verifyLogin);

router.get("/profile", getUserProfile);
router.put("/role", addRole);
router.put("/status", requireCaptain, updateStatus);
router.post("/create-stripe-account", requireCaptain, createStripeAccount);
router.post("/vehicle", requireCaptain, registerVehicle);
router.delete("/vehicle", requireCaptain, deleteVehicle);

export default router;
