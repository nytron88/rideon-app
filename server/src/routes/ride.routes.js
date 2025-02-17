import { Router } from "express";
import {
  createRide,
  getFare,
  createPaymentIntent,
} from "../controllers/ride.controller.js";
import verifyLogin from "../middlewares/auth.middleware.js";
import requireCaptain from "../middlewares/requireCaptain.middleware.js";

const router = Router();

router.use(verifyLogin);

router.post("/", createRide);

router.get("/fare", getFare);

router.post("/create-payment-intent", requireCaptain, createPaymentIntent);

export default router;
