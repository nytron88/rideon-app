import { verifyWebhook } from "../services/stripeService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Ride } from "../models/ride.model.js";
import client from "../services/redisService.js";

const webhookController = asyncHandler(async (req, res) => {
  const event = verifyWebhook(req);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const ride = await Ride.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "paid" },
      { new: true }
    );

    if (ride) {
      console.log(`✅ Ride ${ride._id} marked as PAID`);
      await client.set(`ride:${ride._id}`, JSON.stringify(ride), "EX", 86400);
    } else {
      console.warn("⚠️ Ride not found for paymentIntent:", paymentIntent.id);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Webhook processed successfully"));
});

export default webhookController;
