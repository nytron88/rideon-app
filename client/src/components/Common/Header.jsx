import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import Logo from "../../assets/logo.svg";

const Header = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => dispatch(logout(user?.role));

  const navButtons = [
    // {
    //   label: "Edit Profile",
    //   to: "/edit-profile",
    //   style: "bg-gray-800 hover:bg-gray-700",
    // },
    {
      label: "Logout",
      onClick: handleLogout,
      style: "bg-red-600 hover:bg-red-700",
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <header className="bg-gradient-to-br text-white w-full z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={Logo || "/placeholder.svg"}
            alt="Ride On"
            className="w-14 h-14 mr-3"
          />
          <span className="text-2xl font-bold tracking-wide">Ride On</span>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center space-x-4">
            {navButtons.map((btn, index) => (
              <li key={index}>
                {btn.to ? (
                  <Link
                    to={btn.to}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md ${btn.style}`}
                  >
                    {btn.label}
                  </Link>
                ) : (
                  <button
                    onClick={btn.onClick}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md ${btn.style} cursor-pointer`}
                  >
                    {btn.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
