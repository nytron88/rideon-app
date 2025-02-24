import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createPaymentIntent } from "../../store/slices/rideSlice";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
const PaymentForm = ({ onSuccess, amount, captainId, rideId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      // Create Payment Intent
      const { clientSecret } = await dispatch(
        createPaymentIntent({ amount, captainId, rideId })
      ).unwrap();

      // Confirm Payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/ride-confirmed`,
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else {
        onSuccess();
        toast.success("Payment successful!");
      }
    } catch (err) {
      toast.error(err?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 
                 text-white py-3 rounded-xl font-medium transition-all 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:from-blue-500 hover:to-blue-400
                 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </button>
    </form>
  );
};

// Main Stripe Payment Component
const StripePayment = ({ onSuccess, amount, captainId, rideId }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const { clientSecret } = await dispatch(
          createPaymentIntent({ amount, captainId, rideId })
        ).unwrap();
        setClientSecret(clientSecret);
      } catch (error) {
        toast.error("Failed to initialize payment");
      }
    };

    fetchPaymentIntent();
  }, [amount, captainId, rideId, dispatch]);

  const options = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#3b82f6",
        colorBackground: "#000000",
        colorText: "#ffffff",
        colorDanger: "#ef4444",
      },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">Complete Payment</h3>
        <p className="text-gray-400 mt-1">
          Your payment is secure and encrypted
        </p>
      </div>

      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            onSuccess={onSuccess}
            amount={amount}
            captainId={captainId}
            rideId={rideId}
          />
        </Elements>
      )}
    </div>
  );
};

export default StripePayment;
