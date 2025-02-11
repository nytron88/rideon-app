import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeAccount = async (email) => {
  return await stripe.accounts.create({
    type: "express",
    country: "US",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
};

export const createPaymentIntent = async (amount, captainStripeId) => {
  return await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    payment_method_types: ["card"],
    application_fee_amount: 0,
    transfer_data: {
      destination: captainStripeId,
    },
  });
};

export const createAccountLinks = async (accountId) => {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/captain-dashboard`,
    return_url: `${process.env.FRONTEND_URL}/captain-dashboard`,
    type: "account_onboarding",
  });
};

export const verifyWebhook = (req) => {
  const sig = req.headers["stripe-signature"];
  return stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};
