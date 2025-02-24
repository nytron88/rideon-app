import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  ChevronUp,
  Car,
} from "lucide-react";
import gsap from "gsap";

function ActiveRide({ ride, onStartRide, onVerifyOTP, captainLocation }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  if (!ride) return null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsExpanded(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      containerRef.current,
      { y: "100%" },
      { y: 0, duration: 0.5, ease: "power4.out" }
    );
  }, []);

  const handleStartRide = async () => {
    setIsVerifying(true);
    try {
      await onVerifyOTP(verificationCode);
      onStartRide();
    } catch (error) {
      // Handle error
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    gsap.to(containerRef.current, {
      height: isExpanded ? "120px" : "auto",
      duration: 0.4,
      ease: "power2.inOut",
    });
  };

  // Simplify the proximity check to use the existing distance
  const isNearPickup = useMemo(() => {
    if (!captainLocation) return false;
    // If distance is less than 0.1 miles (about 160 meters)
    return ride.distance <= 0.1;
  }, [captainLocation, ride.distance]);

  return (
    <div className="h-full w-full">
      <div className="h-full flex flex-col bg-black/90 backdrop-blur-xl md:border-l border-white/10">
        {/* Header with Ride Status */}
        <div className="shrink-0 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={ride.user.photo}
                alt={ride.user.fullname}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
              />
              <div>
                <h3 className="text-white font-medium">{ride.user.fullname}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {ride.distance} mi • ${ride.fare}
                  </span>
                  {isNearPickup ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      At pickup location
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      On the way
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Route Info with Distance Indicators */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                  <Navigation className="w-4 h-4 text-blue-400" />
                </div>
                {!isNearPickup && (
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                    <Car className="w-4 h-4 text-white animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400">Pickup</p>
                <p className="text-white font-medium truncate">{ride.pickup}</p>
                {!isNearPickup && (
                  <p className="text-xs text-blue-400 mt-1">
                    {`${ride.duration} min away`}
                  </p>
                )}
              </div>
            </div>
            <div className="w-0.5 h-4 bg-white/10 ml-5" />
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                <MapPin className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400">Destination</p>
                <p className="text-white font-medium truncate">
                  {ride.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Ride Details Grid */}
          <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/10">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span>Time</span>
              </div>
              <p className="text-sm text-white font-medium">
                {ride.duration} min
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Navigation className="w-4 h-4" />
                <span>Distance</span>
              </div>
              <p className="text-sm text-white font-medium">
                {ride.distance} mi
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Fare</span>
              </div>
              <p className="text-sm text-white font-medium">${ride.fare}</p>
            </div>
          </div>

          {/* OTP Verification - Only show when near pickup */}
          {isNearPickup ? (
            <div className="p-4 space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">
                  Enter verification code from rider
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 4-digit code"
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 
                           text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  maxLength={4}
                />
              </div>

              <button
                onClick={handleStartRide}
                disabled={verificationCode.length !== 4 || isVerifying}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 
                         text-white py-3 rounded-xl font-medium transition-all 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:from-green-500 hover:to-green-400
                         active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Start Ride"
                )}
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <p className="text-center text-blue-400 text-sm">
                  Navigate to pickup location to start the ride
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActiveRide;
