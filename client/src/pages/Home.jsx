import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, Clock, Shield, MapPin, User, Car } from "lucide-react";
import Logo from "../assets/logo.svg";

function Home() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <div className="text-white">Authenticated Home Page</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-8 w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl flex items-center justify-center">
            <img
              src={Logo}
              alt="Ride On"
              className="w-20 h-20 md:w-28 md:h-28"
            />
          </div>

          {/* Hero Text */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Ride, Your Way
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            Experience seamless urban mobility with Ride On. Get to your
            destination with just a few taps.
          </p>

          {/* Role Selection Section */}
          <div className="w-full max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">
              Get Started
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Card */}
              <Link
                to="/user-signup"
                className="group bg-gray-800 p-8 rounded-2xl hover:bg-gray-700 transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-4 bg-white/10 rounded-full">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ride as a User</h3>
                  <p className="text-gray-400 mb-6">
                    Book rides and travel comfortably to your destination
                  </p>
                  <span className="inline-flex items-center gap-2 text-white font-medium">
                    Sign up as User
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* Captain Card */}
              <Link
                to="/captain-signup"
                className="group bg-gray-800 p-8 rounded-2xl hover:bg-gray-700 transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-4 bg-white/10 rounded-full">
                    <Car className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Drive as a Captain
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Join our fleet and earn money on your own schedule
                  </p>
                  <span className="inline-flex items-center gap-2 text-white font-medium">
                    Sign up as Captain
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl">
            <Clock className="w-12 h-12 mb-4 text-white" />
            <h3 className="text-xl font-semibold mb-2">Quick Pickup</h3>
            <p className="text-gray-400">
              Get picked up within minutes of booking your ride
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <Shield className="w-12 h-12 mb-4 text-white" />
            <h3 className="text-xl font-semibold mb-2">Safe Rides</h3>
            <p className="text-gray-400">
              Verified drivers and real-time trip monitoring
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <MapPin className="w-12 h-12 mb-4 text-white" />
            <h3 className="text-xl font-semibold mb-2">Live Tracking</h3>
            <p className="text-gray-400">
              Track your ride in real-time with precise GPS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
