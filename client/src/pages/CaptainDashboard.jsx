import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { InactiveCaptain, RideRequest, ActiveRide } from "../components";
import { updateStatus } from "../store/slices/userSlice";
import { toast } from "react-toastify";
import { socketService } from "../services/socket.service";
import { clearNewRideRequest, setCurrentRide } from "../store/slices/rideSlice";
import { Navigation, MapPin, DollarSign } from "lucide-react";

function CaptainDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { newRideRequest, currentRide } = useSelector((state) => state.ride);

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
              timeout: 15000,
              maximumAge: 5000,
            }
          );
        } else {
          toast.error("Geolocation is not supported by your browser.");
        }
      };

      getLocation();
      const locationInterval = setInterval(getLocation, 10000);

      return () => {
        clearInterval(locationInterval);
        socketService.disconnect();
      };
    }
  }, [user?.status]);

  const handleActivate = async () => {
    try {
      await dispatch(updateStatus({ status: "active" })).unwrap();
      toast.success("Account activated successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to activate account");
    }
  };

  const handleAcceptRide = async (ride) => {
    try {
      socketService.emiteRideAccepted(ride.rideId);
      dispatch(clearNewRideRequest());
      dispatch(setCurrentRide(ride));
      toast.success("Ride accepted successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to accept ride");
    }
  };

  const handleDeclineRide = () => {
    try {
      dispatch(clearNewRideRequest());
      toast.info("Ride declined");
    } catch (error) {
      toast.error(error?.message || "Failed to decline ride");
    }
  };

  if (!isActive) {
    return (
      <div className="h-screen bg-black">
        <InactiveCaptain user={user} onActivate={handleActivate} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 overflow-auto">
        {!currentRide && !newRideRequest && (
          <div className="flex items-center justify-center min-h-full p-6">
            <div className="w-full max-w-4xl space-y-6 bg-black/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              {/* Status and Welcome in a row on larger screens */}
              <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
                {/* Status Indicator - Centered on mobile, left on desktop */}
                <div className="w-full md:w-auto">
                  <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">
                      Online - Ready for rides
                    </span>
                  </div>
                </div>

                {/* Welcome Message - Always centered */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">
                    Welcome, {user?.fullname}!
                  </h2>
                  <p className="text-gray-400">
                    We'll notify you when new rides come in
                  </p>
                </div>

                {/* Invisible spacer for alignment */}
                <div className="w-full md:w-auto invisible">
                  <div className="px-4 py-2.5">Spacer</div>
                </div>
              </div>

              {/* Tips Section in a grid on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ...existing Quick Tips section... */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h3 className="text-white font-medium mb-4">Quick Tips</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-400">
                        Position yourself in busy areas to receive more ride
                        requests
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg shrink-0 mt-0.5">
                        <Navigation className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-400">
                        Keep your location services enabled for accurate ride
                        matching
                      </p>
                    </li>
                  </ul>
                </div>

                {/* ...existing When You Get a Ride section... */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h3 className="text-white font-medium mb-3">
                    When You Get a Ride
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg shrink-0 mt-0.5">
                        <Navigation className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium mb-1">
                          Navigation
                        </p>
                        <p className="text-sm text-gray-400">
                          Use Google Maps or your preferred navigation app to
                          reach the pickup location
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="p-1.5 bg-green-500/20 rounded-lg shrink-0 mt-0.5">
                        <DollarSign className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium mb-1">
                          Ride Verification
                        </p>
                        <p className="text-sm text-gray-400">
                          Once at pickup location, ask the rider for their
                          4-digit OTP to start the ride
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Important section full width */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-medium mb-3">Important</h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-400">
                    • Keep your phone charged and within reach
                  </li>
                  <li className="text-sm text-gray-400">
                    • Stay in areas with good network coverage
                  </li>
                  <li className="text-sm text-gray-400">
                    • Maintain a professional appearance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Keep existing ride request and active ride components */}
        {newRideRequest && !currentRide && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-20">
            <RideRequest
              ride={newRideRequest}
              onAccept={handleAcceptRide}
              onDecline={handleDeclineRide}
            />
          </div>
        )}
        {currentRide && (
          <div className="absolute inset-0">
            <ActiveRide ride={currentRide} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CaptainDashboard;
