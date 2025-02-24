import React from "react";
import { useSelector } from "react-redux";
import { StripePayment } from "../../components";

function RideConfirmation() {
  const { currentRide } = useSelector((state) => state.ride);

  if (!currentRide) return null;

  return (
    <div className="h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-black/90 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl text-white font-bold mb-4">
          Confirm & Pay for Ride
        </h2>

        <StripePayment
          onSuccess={() => {
            // Handle success (e.g., navigate to ride-confirmed or show success message)
          }}
          amount={currentRide.fare * 100} // Convert to cents
          captainId={currentRide.captain?._id}
          rideId={currentRide._id}
        />
      </div>
    </div>
  );
}

export default RideConfirmation;
