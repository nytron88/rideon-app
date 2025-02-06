import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader } from "../index";

function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate();
  const { isAuthenticated: authStatus, loading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (loading) return;

    if (authentication && !authStatus) {
      navigate("/login");
    } else if (!authentication && authStatus) {
      navigate("/");
    }
  }, [authStatus, navigate, authentication]);

  return loading ? (
    <>
      <Loader />
    </>
  ) : (
    <>{children}</>
  );
}

export default AuthLayout;
