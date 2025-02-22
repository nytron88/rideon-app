import { io } from "socket.io-client";
import { setSocket, setConnected, setError } from "../store/slices/socketSlice";
import { store } from "../store/store";
import { setNewRideRequest } from "../store/slices/rideSlice"; // Add this import

class SocketService {
  initialize() {
    try {
      const socket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
      });

      socket.on("connect", () => {
        store.dispatch(setError(null));
        store.dispatch(setConnected(true));
      });

      socket.on("disconnect", () => {
        store.dispatch(setConnected(false));
      });

      socket.on("connect_error", (error) => {
        store.dispatch(
          setError({
            type: "CONNECTION_ERROR",
            message: error.message || "Failed to connect to server",
          })
        );
      });

      socket.on("socket_error", ({ statusCode, event, message }) => {
        store.dispatch(
          setError({
            type: "SOCKET_ERROR",
            event,
            statusCode,
            message: message || `Error in ${event}`,
          })
        );
      });

      socket.on("error", (error) => {
        store.dispatch(
          setError({
            type: "GENERAL_ERROR",
            message: error.message || "An unexpected error occurred",
          })
        );
      });

      socket.on("new_ride_request", (ride) => {
        store.dispatch(setNewRideRequest(ride));
      });

      store.dispatch(setSocket(socket));
    } catch (error) {
      store.dispatch(
        setError({
          type: "INITIALIZATION_ERROR",
          message: "Failed to initialize socket connection",
        })
      );
    }
  }

  emitUserOnline() {
    try {
      const { socket } = store.getState().socket;
      const { user } = store.getState().user;

      if (!socket) {
        throw new Error("Socket not initialized");
      }
      if (!user?._id) {
        throw new Error("User not authenticated");
      }

      socket.emit("user_online", user._id);
    } catch (error) {
      store.dispatch(
        setError({
          type: "EMIT_ERROR",
          event: "user_online",
          message: error.message,
        })
      );
    }
  }

  emitCaptainOnline() {
    try {
      const { socket } = store.getState().socket;
      const { user } = store.getState().user;

      if (!socket) {
        throw new Error("Socket not initialized");
      }
      if (!user?._id) {
        throw new Error("User not authenticated");
      }

      socket.emit("captain_online", user._id);
    } catch (error) {
      store.dispatch(
        setError({
          type: "EMIT_ERROR",
          event: "captain_online",
          message: error.message,
        })
      );
    }
  }

  emitJoinRide(rideId) {
    try {
      const { socket } = store.getState().socket;

      if (!socket) {
        throw new Error("Socket not initialized");
      }
      if (!rideId) {
        throw new Error("Ride ID is required");
      }

      socket.emit("join_ride", rideId);
    } catch (error) {
      store.dispatch(
        setError({
          type: "EMIT_ERROR",
          event: "join_ride",
          message: error.message,
        })
      );
    }
  }

  emitCaptainLocation(location) {
    try {
      const { socket } = store.getState().socket;

      if (!socket) {
        throw new Error("Socket not initialized");
      }
      if (!location?.latitude || !location?.longitude) {
        throw new Error("Invalid location data");
      }

      socket.emit("captain_location", location);
    } catch (error) {
      store.dispatch(
        setError({
          type: "EMIT_ERROR",
          event: "captain_location",
          message: error.message,
        })
      );
    }
  }

  disconnect() {
    try {
      const { socket } = store.getState().socket;
      if (socket) {
        socket.disconnect();
        store.dispatch(setSocket(null));
        store.dispatch(setConnected(false));
      }
    } catch (error) {
      store.dispatch(
        setError({
          type: "DISCONNECT_ERROR",
          message: "Failed to disconnect socket",
        })
      );
    }
  }
}

export const socketService = new SocketService();
