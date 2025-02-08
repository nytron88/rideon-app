import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getUserProfile } from "./store/slices/authSlice";
import apiClient from "./services/api";
import { useDispatch, useSelector } from "react-redux";
import { Footer, Header, Loader, Error } from "./components";

function App() {
  const [healthCheckError, setHealthCheckError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const healthCheck = async () => {
      try {
        const response = await apiClient.get("/healthcheck");
        console.log("Healthcheck:", response.data);
      } catch (error) {
        setHealthCheckError("Healthcheck failed. Server might be down.");
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };

    healthCheck();
    const interval = setInterval(healthCheck, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const setExistingUser = async () => {
      if (isAuthenticated) return;

      await dispatch(getUserProfile());
    };

    setExistingUser();
  }, [dispatch, isAuthenticated]);

  if (loading || initialLoading) {
    return <Loader />;
  }

  if (healthCheckError) {
    return (
      <Error
        message={healthCheckError}
        showHomeButton={false}
        details={"You can contact us at sidjain88tx@gmail.com."}
      />
    );
  }

  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
