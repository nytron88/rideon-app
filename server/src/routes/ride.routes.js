import { Router } from "express";
import {
  createRide,
  createPaymentIntent,
} from "../controllers/ride.controller.js";
import verifyLogin from "../middlewares/auth.middleware.js";
import requireCaptain from "../middlewares/requireCaptain.middleware.js";

const router = Router();

router.use(verifyLogin);

router.post("/", createRide);

router.post("/create-payment-intent", requireCaptain, createPaymentIntent);

export default router;
