import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LiveTracking } from "../components";
import { InactiveCaptain, RideRequest, ActiveRide } from "../components";
import { updateStatus } from "../store/slices/userSlice";
import { toast } from "react-toastify";
import { socketService } from "../services/socket.service";
import { clearNewRideRequest, setCurrentRide } from "../store/slices/rideSlice";

function CaptainDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { newRideRequest, currentRide } = useSelector((state) => state.ride);
  const [captainLocation, setCaptainLocation] = useState(null);

  const isActive = user?.status === "active";

  useEffect(() => {
    if (user?.status === "active") {
      socketService.initialize();
      socketService.emitCaptainOnline();

      const getLocation = () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString(),
              };

              setCaptainLocation(location);
              socketService.emitCaptainLocation(location);
            },
            (error) => {
              console.error("Error getting location:", error);
              let errorMessage = "Unable to get location. ";

              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage +=
                    "Please enable location services in your browser.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage += "Location information is unavailable.";
                  break;
                case error.TIMEOUT:
                  errorMessage +=
                    "Location request timed out. Please try again.";
                  break;
                default:
                  errorMessage += "Please check your GPS settings.";
              }

              toast.error(errorMessage);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000, // Increased timeout to 15 seconds
              maximumAge: 5000, // Allow locations up to 5 seconds old
            }
          );
        } else {
          toast.error("Geolocation is not supported by your browser.");
        }
      };

      // Get initial location
      getLocation();

      // Set up interval for location updates
      const locationInterval = setInterval(getLocation, 10000);

      return () => {
        clearInterval(locationInterval);
        socketService.disconnect();
      };
    }
  }, [user?.status]);

  const handleAcceptRide = async (ride) => {
    try {
      socketService.emiteRideAccepted(ride.rideId);
      dispatch(clearNewRideRequest());
      dispatch(setCurrentRide(ride));
      toast.success("Ride accepted successfully!");
    } catch (error) {
      toast.error("Failed to accept ride");
    }
  };

  const handleDeclineRide = () => {
    dispatch(clearNewRideRequest());
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
        {/* Status Bar - Only show when no current ride */}
        {!currentRide && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div
              className="bg-black/90 backdrop-blur-xl rounded-xl p-4 border border-white/10 
                           shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">
                  Active - Ready for rides
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="absolute inset-0">
          <LiveTracking
            origin={currentRide?.pickup}
            destination={currentRide?.destination}
            isRideActive={!!currentRide}
            captainLocation={captainLocation}
            isCaptain={true}
          />
        </div>

        {/* Ride Request Popup */}
        {newRideRequest && !currentRide && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm 
                       flex items-center justify-center p-4 z-20"
          >
            <RideRequest
              ride={newRideRequest}
              onAccept={handleAcceptRide}
              onDecline={handleDeclineRide}
            />
          </div>
        )}

        {/* Active Ride Panel */}
        {currentRide && (
          <ActiveRide
            ride={currentRide}
            onStartRide={() => {
              // Handle ride start
              toast.success("Ride started successfully!");
            }}
            onVerifyOTP={async (code) => {
              // Verify OTP logic
              if (code !== ride.otp) {
                toast.error("Invalid verification code");
                throw new Error("Invalid code");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default CaptainDashboard;
