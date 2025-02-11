import { Router } from "express";
import { createPaymentIntent } from "../controllers/ride.controller.js";
import verifyLogin from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyLogin);

router.post("/create-payment-intent", createPaymentIntent);

export default router;
