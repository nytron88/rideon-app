import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { addRole, updateStatus } from "../../store/slices/userSlice";
import Logo from "../../assets/logo.svg";
import { toast } from "react-toastify";
import { ToastContainer } from "../index";
import {
  LogOut,
  ChevronDown,
  Car,
  PenSquare,
  Plus,
  Wallet,
  UserMinus,
} from "lucide-react";

const Header = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => dispatch(logout());

  const handleBecomeCaptain = async () => {
    setIsDropdownOpen(false);
    try {
      await dispatch(addRole({ role: "captain" })).unwrap();
      toast.success(
        "Successfully became a captain, to continue please connect with stripe and add vehicle details, if you haven't already"
      );
    } catch (error) {
      toast.error(error?.message || "An error occurred");
    }
  };

  const handleToggleStatus = async () => {
    try {
      await dispatch(
        updateStatus({
          status: user.status === "active" ? "inactive" : "active",
        })
      ).unwrap();
      setIsDropdownOpen(false);
    } catch (error) {
      toast.error(error?.message || "An error occurred");
    }
  };

  const handleVehicleAction = () => {
    setIsDropdownOpen(false);
    navigate("/captain/vehicle");
  };

  const handleStripeConnect = () => {
    setIsDropdownOpen(false);
    navigate("/captain/onboarding");
  };

  const handleRevertToUser = async () => {
    try {
      await dispatch(addRole({ role: "user" })).unwrap();
      setIsDropdownOpen(false);
      toast.success("Successfully reverted to user");
    } catch (error) {
      toast.error(error?.message || "An error occurred");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  return (
    <header className="bg-gradient-to-br text-white w-full z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center cursor-pointer">
          <img
            src={Logo || "/placeholder.svg"}
            alt="Ride On"
            className="w-14 h-14 mr-3"
          />
          <span className="text-2xl font-bold tracking-wide">Ride On</span>
        </Link>

        <ToastContainer />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Profile Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <img
              src={
                user.photo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.fullname
                )}&background=random`
              }
              alt={user.fullname}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/10"
            />
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 cursor-pointer ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 rounded-xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl p-3 sm:p-4 space-y-3 z-50">
              {/* User Info */}
              <div className="space-y-1.5 sm:space-y-2">
                <p className="font-medium text-base sm:text-lg truncate">
                  {user.fullname}
                </p>
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="px-2 py-0.5 sm:py-1 rounded-full bg-white/10 capitalize">
                    {user.role}
                  </span>
                  {user.role === "captain" && (
                    <span
                      className={`px-2 py-0.5 sm:py-1 rounded-full ${
                        user.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      } capitalize`}
                    >
                      {user.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Actions */}
              <div className="space-y-1">
                {user.role === "user" ? (
                  <button
                    onClick={handleBecomeCaptain}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base cursor-pointer"
                  >
                    <Car className="w-4 h-4" />
                    <span>Become a Captain</span>
                  </button>
                ) : (
                  user.role === "captain" && (
                    <>
                      {!user.stripeAccountId && (
                        <button
                          onClick={handleStripeConnect}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors text-sm sm:text-base cursor-pointer"
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Connect with Stripe</span>
                        </button>
                      )}
                      <button
                        onClick={handleVehicleAction}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors text-sm sm:text-base cursor-pointer"
                      >
                        {user.vehicle ? (
                          <>
                            <PenSquare className="w-4 h-4" />
                            <span>Edit Vehicle</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Add Vehicle</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleToggleStatus}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg 
                        ${
                          user.status === "active"
                            ? "text-yellow-500 hover:bg-yellow-500/10"
                            : "text-green-500 hover:bg-green-500/10"
                        } 
                        transition-colors text-sm sm:text-base cursor-pointer`}
                      >
                        <Car className="w-4 h-4" />
                        <span>
                          {user.status === "active"
                            ? "Become Inactive"
                            : "Become Active"}
                        </span>
                      </button>
                      <button
                        onClick={handleRevertToUser}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-orange-500 hover:bg-orange-500/10 transition-colors text-sm sm:text-base cursor-pointer"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span>Revert to User</span>
                      </button>
                    </>
                  )
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
