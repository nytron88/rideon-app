import express from "express";
import webhookController from "../webhooks/stripe.webhook.js";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookController
);

export default router;
