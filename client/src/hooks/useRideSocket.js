import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRide } from "../store/slices/rideSlice";

export const useRideSocket = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((state) => state.socket);
  const { currentRide } = useSelector((state) => state.ride);

  useEffect(() => {
    if (!socket) return;

    socket.on("ride_accepted", (ride) => {
      dispatch(setCurrentRide(ride));
    });

    socket.on("ride_started", (ride) => {
      dispatch(setCurrentRide(ride));
    });

    socket.on("ride_completed", (ride) => {
      dispatch(setCurrentRide(ride));
    });

    socket.on("captain_location", (location) => {
      // Handle captain location updates
    });

    return () => {
      socket.off("ride_accepted");
      socket.off("ride_started");
      socket.off("ride_completed");
      socket.off("captain_location");
    };
  }, [socket, dispatch]);

  return {
    joinRide: (rideId) => socket?.emit("join_ride", rideId),
    leaveRide: (rideId) => socket?.emit("leave_ride", rideId),
  };
};
