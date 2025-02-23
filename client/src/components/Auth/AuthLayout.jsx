import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader } from "../index";

function AuthLayout({ children, authentication = true, allowedRole = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: authStatus, loading } = useSelector(
    (state) => state.auth
  );
  const { user } = useSelector((state) => state.user);
  const { currentRide } = useSelector((state) => state.ride);

  useEffect(() => {
    if ((authentication && !user) || loading) return;

    if (currentRide && location.pathname !== "/") {
      navigate("/");
      return;
    }

    if (authentication && !authStatus) {
      navigate("/get-started");
      return;
    }

    if (authentication && authStatus && allowedRole) {
      if (user?.role !== allowedRole) {
        navigate("/");
        return;
      }
    }

    if (!authentication && authStatus) {
      navigate("/");
    }
  }, [
    authStatus,
    loading,
    navigate,
    authentication,
    allowedRole,
    user,
    currentRide,
    location.pathname,
  ]);

  return loading ? <Loader /> : <>{children}</>;
}

export default AuthLayout;
