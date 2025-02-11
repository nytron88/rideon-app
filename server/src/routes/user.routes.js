import { Router } from "express";
import verifyLogin from "../middlewares/auth.middleware.js";
import {
  getUserProfile,
  addRole,
  updateStatus,
  createStripeAccount,
} from "../controllers/user.controller.js";

const router = Router();

router.use(verifyLogin);

router.get("/profile", getUserProfile);
router.put("/role", addRole);
router.put("/status", updateStatus);
router.post("create-stripe-account", createStripeAccount);

export default router;
