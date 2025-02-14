import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LiveTracking } from "../components";
import { InactiveCaptain, RideRequest } from "../components";
import { updateStatus } from "../store/slices/userSlice";
import { toast } from "react-toastify";
import gsap from "gsap";

function CaptainDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [currentRide, setCurrentRide] = useState(null);
  const [showRequest, setShowRequest] = useState(false);

  const isActive = user?.status === "active";
  
  // Simulated ride request - replace with real data
  const rideData = {
    id: "ride123",
    pickup: "Central Station",
    destination: "Airport Terminal 1",
    rider: {
      name: "John Doe",
      photo: "https://i.pravatar.cc/150?img=68",
      rating: 4.8,
      totalRides: 24,
      memberSince: "Jan 2024",
      preferredPayment: "VISA •••• 4242",
    },
    estimatedTime: "25-30",
    distance: "12.5",
    fare: "24.50",
  };

  // Simulate incoming ride request
  useEffect(() => {
    if (isActive && !currentRide) {
      const timer = setTimeout(() => {
        setShowRequest(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentRide]);

  const handleAcceptRide = async (ride) => {
    try {
      // Add your ride acceptance logic here
      setCurrentRide(ride);
      setShowRequest(false);
      toast.success("Ride accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept ride");
    }
  };

  const handleDeclineRide = () => {
    setShowRequest(false);
    toast.info("Ride declined");
  };

  const handleActivate = async () => {
    try {
      await dispatch(updateStatus({ status: "active" })).unwrap();
      toast.success("Account activated successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to activate account");
    }
  };

  // If captain is inactive, show setup steps
  if (!isActive) {
    return <InactiveCaptain user={user} onActivate={handleActivate} />;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-[calc(100vh-64px)]">
        {/* Status Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-black/90 backdrop-blur-xl rounded-xl p-4 border border-white/10 
                       shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-medium">Active - Ready for rides</span>
            </div>
            {currentRide && (
              <span className="text-gray-400">
                Current ride: {currentRide.rider.name}
              </span>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="absolute inset-0">
          <LiveTracking />
        </div>

        {/* Ride Request Popup */}
        {showRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm 
                       flex items-center justify-center p-4 z-20 animate-in fade-in">
            <RideRequest
              ride={rideData}
              onAccept={handleAcceptRide}
              onDecline={handleDeclineRide}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CaptainDashboard;
