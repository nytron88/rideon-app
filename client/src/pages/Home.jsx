import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, Clock, Shield, MapPin, Users } from "lucide-react";
import Logo from "../assets/logo.svg";
import { Footer } from "../components";
import { CaptainDashboard, UserDashboard } from "./index";

function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);

  if (isAuthenticated && user) {
    return user.role === "captain" && user.status === "active" ? (
      <CaptainDashboard />
    ) : (
      <UserDashboard />
    );
  }

  return (
    <>
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

            {/* Get Started Section */}
            <div className="w-full max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-8">
                Get Started
              </h2>
              <div className="bg-gray-800 p-8 rounded-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-4 bg-white/10 rounded-full">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Join Our Community
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-xl">
                    Whether you're looking to ride or drive, Ride On offers
                    opportunities for everyone. Join our growing community and
                    experience modern urban mobility.
                  </p>
                  <Link
                    to="/get-started"
                    className="group inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                  >
                    Sign in or create an account to continue
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
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
        <Footer />
      </div>
    </>
  );
}

export default Home;
