import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Clock,
  Navigation,
  User,
  DollarSign,
  Star,
  Award,
} from "lucide-react";
import gsap from "gsap";

const MOCK_RIDE_REQUEST = {
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

function RideRequest({ ride, onAccept, onDecline }) {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    // Initial animation
    const tl = gsap.timeline();

    tl.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 20,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power4.out",
      }
    );

    tl.fromTo(
      contentRef.current.children,
      {
        opacity: 0,
        y: 15,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.2"
    );

    tl.fromTo(
      actionsRef.current.children,
      {
        opacity: 0,
        y: 10,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "back.out(1.7)",
      },
      "-=0.2"
    );

    // Cleanup
    return () => tl.kill();
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);

    // Animate out
    const tl = gsap.timeline();

    tl.to(containerRef.current, {
      scale: 0.95,
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: async () => {
        try {
          await onAccept(ride);
        } catch (error) {
          console.error("Error accepting ride:", error);
          setIsLoading(false);

          // Animate back in if there's an error
          gsap.to(containerRef.current, {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          });
        }
      },
    });
  };

  const handleDecline = () => {
    // Animate out
    gsap.to(containerRef.current, {
      scale: 0.95,
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => onDecline(),
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto overscroll-contain"
    >
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        {/* Header - Make it sticky */}
        <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl p-4 sm:p-6 border-b border-white/10">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
            New Ride Request
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
            <p className="text-sm text-gray-400">Accept within 30 seconds</p>
          </div>
        </div>

        {/* Content - Adjust padding and spacing */}
        <div ref={contentRef} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Rider Info - Improve mobile layout */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <img
              src={ride.rider.photo}
              alt={ride.rider.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/10"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="text-white font-medium truncate">
                  {ride.rider.name}
                </h4>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full shrink-0">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-white">
                    {ride.rider.rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 flex-wrap">
                <Award className="w-4 h-4 shrink-0" />
                <span className="truncate">{ride.rider.totalRides} rides</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">
                  Member since {ride.rider.memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Trip Details - Make it more compact on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Duration</span>
              </div>
              <p className="text-white font-medium">{ride.estimatedTime} min</p>
            </div>
            <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-1">
                <Navigation className="w-4 h-4 shrink-0" />
                <span>Distance</span>
              </div>
              <p className="text-white font-medium">{ride.distance} km</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-1">
                <DollarSign className="w-4 h-4 shrink-0" />
                <span>Fare</span>
              </div>
              <p className="text-white font-medium">${ride.fare}</p>
            </div>
          </div>

          {/* Route Details - Improve spacing */}
          <div className="space-y-3 sm:space-y-4 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Navigation className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pickup</p>
                <p className="text-white font-medium">{ride.pickup}</p>
              </div>
            </div>
            <div className="w-0.5 h-4 bg-white/10 ml-5" />
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MapPin className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Destination</p>
                <p className="text-white font-medium">{ride.destination}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Payment Method</p>
            <p className="text-white font-medium">
              {ride.rider.preferredPayment}
            </p>
          </div>
        </div>

        {/* Actions - Make it sticky */}
        <div
          ref={actionsRef}
          className="sticky bottom-0 bg-black/90 backdrop-blur-xl p-4 sm:p-6 pt-0 grid grid-cols-2 gap-2 sm:gap-4"
        >
          <button
            onClick={handleDecline}
            disabled={isLoading}
            className="group px-4 sm:px-6 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 
                     border border-white/10 rounded-xl font-medium transition-all 
                     disabled:opacity-50 text-white transform hover:scale-[0.98] 
                     active:scale-95 text-sm sm:text-base"
          >
            <span className="block transform group-hover:scale-105 transition-transform cursor-pointer">
              Decline
            </span>
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="group px-4 sm:px-6 py-3 sm:py-3.5 bg-white hover:bg-gray-100 
                     text-black rounded-xl font-medium transition-all disabled:opacity-50 
                     flex items-center justify-center gap-2 transform hover:scale-[0.98] 
                     active:scale-95 text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span className="block transform group-hover:scale-105 transition-transform cursor-pointer">
                Accept
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

RideRequest.defaultProps = {
  ride: {
    id: "",
    pickup: "",
    destination: "",
    rider: {
      name: "",
      photo: "https://via.placeholder.com/150",
      rating: 0,
      totalRides: 0,
      memberSince: "",
      preferredPayment: "",
    },
    estimatedTime: "",
    distance: "",
    fare: "",
  },
};

export default RideRequest;
