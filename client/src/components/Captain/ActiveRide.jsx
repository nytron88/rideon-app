import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Clock, DollarSign, ChevronUp } from "lucide-react";
import gsap from "gsap";

function ActiveRide({ ride, onStartRide, onVerifyOTP }) {
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

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 md:fixed md:top-0 md:right-0 md:bottom-auto 
                md:left-auto md:w-[400px] z-20"
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-t-3xl md:rounded-none md:h-screen
                  border border-white/10 shadow-2xl overflow-hidden
                  md:border-l md:border-t-0 md:border-b-0 md:border-r-0"
      >
        {/* Collapsible Header - Only collapsible on mobile */}
        <div
          onClick={() => isMobile && toggleExpand()}
          className={`p-4 border-b border-white/10 
                   ${isMobile ? "cursor-pointer hover:bg-white/5" : ""} 
                   transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={ride.user.photo}
                alt={ride.user.fullname}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
              />
              <div>
                <h3 className="text-white font-medium">{ride.user.fullname}</h3>
                <p className="text-sm text-gray-400">
                  {ride.distance} mi • ${ride.fare}
                </p>
              </div>
            </div>
            {isMobile && (
              <ChevronUp
                className={`w-5 h-5 text-white transition-transform duration-300 
                         ${isExpanded ? "rotate-0" : "rotate-180"}`}
              />
            )}
          </div>
        </div>

        {/* Content - Always visible on desktop */}
        <div
          className={`transition-all duration-300 md:block
                   ${isExpanded ? "block" : "hidden"}`}
        >
          {/* Route Info */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                <Navigation className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400">Pickup</p>
                <p className="text-white font-medium truncate">{ride.pickup}</p>
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

          {/* OTP Verification */}
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

            {/* Action Button */}
            <button
              onClick={handleStartRide}
              disabled={verificationCode.length !== 4 || isVerifying}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                       text-white py-3 rounded-xl font-medium transition-all 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:from-blue-500 hover:to-purple-500
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
        </div>
      </div>
    </div>
  );
}

export default ActiveRide;
