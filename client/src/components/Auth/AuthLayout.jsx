import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader } from "../index";

function AuthLayout({ children, authentication = true, captainOnly = false }) {
  const navigate = useNavigate();
  const { isAuthenticated: authStatus, loading } = useSelector(
    (state) => state.auth
  );
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (loading) return;

    if (authentication && !authStatus) {
      navigate("/login");
      return;
    }

    if (captainOnly && user?.role !== "captain") {
      navigate("/");
      return;
    }

    if (captainOnly && user?.role === "captain") {
      navigate("/captain/dashboard");
      return;
    }

    if (!authentication && authStatus) {
      navigate("/");
    }
  }, [authStatus, loading, navigate, authentication, captainOnly, user]);

  return loading ? <Loader /> : <>{children}</>;
}

export default AuthLayout;
