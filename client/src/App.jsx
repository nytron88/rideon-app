import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getUserProfile } from "./store/slices/userSlice";
import apiClient from "./services/api.service";
import { useDispatch, useSelector } from "react-redux";
import { Header, Loader, Error } from "./components";
import { fetchCurrentRide } from "./store/slices/rideSlice";
import { socketService } from "./services/socket.service";

function App() {
  const [healthCheckError, setHealthCheckError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);
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
      await dispatch(fetchCurrentRide());
    };

    setExistingUser();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.role === "captain" &&
      user?.status === "active"
    ) {
      socketService.initialize();
      socketService.emitCaptainOnline();

      dispatch(fetchCurrentRide()).then(({ payload }) => {
        if (payload?._id) {
          socketService.emitJoinRide(payload._id);
        }
      });
    } else if (isAuthenticated) {
      socketService.initialize();
      dispatch(fetchCurrentRide()).then(({ payload }) => {
        if (payload?._id) {
          socketService.emitJoinRide(payload._id);
        }
      });
    }
  }, [dispatch, isAuthenticated, user?.role, user?.status]);

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
    </div>
  );
}

export default App;
