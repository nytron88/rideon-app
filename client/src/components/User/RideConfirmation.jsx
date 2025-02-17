import React, { useState } from "react";
import { MapPin, CreditCard, X, Navigation } from "lucide-react";

function RideConfirmation({ ride, onConfirm, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  return (
    <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Confirm your ride</h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Route Details */}
        <div className="space-y-4 border-b border-white/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Navigation className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pickup</p>
              <p className="text-white">Current Location</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MapPin className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Destination</p>
              <p className="text-white">Destination Location</p>
            </div>
          </div>
        </div>

        {/* Ride Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Estimated Time</p>
            <p className="text-white font-medium">{ride.duration} mins</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Distance</p>
            <p className="text-white font-medium">{ride.distance} miles</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Fare</p>
            <p className="text-white font-medium">${ride.fare}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
          <CreditCard className="w-5 h-5 text-white" />
          <div className="flex-1">
            <p className="text-white font-medium">Payment Method</p>
            <p className="text-sm text-gray-400">Visa ending in 4242</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full bg-white text-black py-3 rounded-xl font-medium
                     hover:bg-gray-100 transition-all duration-300 disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Ride"
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full bg-white/5 text-white py-3 rounded-xl font-medium
                     hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RideConfirmation;
