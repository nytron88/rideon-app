import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStripeAccount } from "../store/slices/userSlice";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { ToastContainer } from "../components";

function CaptainOnboarding() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await dispatch(createStripeAccount()).unwrap();
      window.location.href = response.onboardingUrl;
    } catch (error) {
      toast.error(error.message || "Failed to connect with Stripe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <ToastContainer />

          {/* Header */}
          <div className="mb-8">
            <Link
              to="/captain/vehicle"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Vehicle Details
            </Link>
            <h1 className="text-2xl font-bold">Connect Payment Account</h1>
            <p className="text-gray-400 mt-2">
              Set up your payment account to start receiving earnings from rides
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 shadow-xl">
            {user?.stripeAccountId ? (
              // Already connected state
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Payment Account Connected
                </h2>
                <p className="text-gray-400 mb-6">
                  Your Stripe account has been successfully connected
                </p>
                <Link
                  to="/captain/dashboard"
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              // Not connected state
              <div className="space-y-6">
                {/* Info Box */}
                <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <AlertCircle className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-blue-400">
                      Before you can start accepting rides:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Connect your bank account</li>
                      <li>Verify your identity</li>
                      <li>Provide required business information</li>
                    </ul>
                  </div>
                </div>

                {/* Connect Button */}
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect with Stripe
                    </>
                  )}
                </button>

                {/* Additional Info */}
                <p className="text-sm text-gray-400 text-center">
                  By connecting, you agree to Stripe's{" "}
                  <a
                    href="https://stripe.com/legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Terms of Service
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaptainOnboarding;
