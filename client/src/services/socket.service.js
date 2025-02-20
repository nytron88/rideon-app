import { io } from "socket.io-client";
import { setSocket, setConnected, setError } from "../store/slices/socketSlice";
import { store } from "../store/store";

class SocketService {
  initialize() {
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      store.dispatch(setConnected(true));
    });

    socket.on("disconnect", () => {
      store.dispatch(setConnected(false));
    });

    socket.on("connect_error", () => {
      store.dispatch(setError("Failed to connect to server"));
    });

    socket.on("socket_error", ({ message }) => {
      store.dispatch(setError(message));
    });

    socket.on("error", (error) => {
      store.dispatch(setError(error.message || "An unexpected error occurred"));
    });

    store.dispatch(setSocket(socket));
    return socket;
  }

  emitUserOnline() {
    const { socket } = store.getState().socket;
    if (socket) {
      const userId = store.getState().user.user._id;
      socket.emit("user_online", userId);
    }
  }

  emitCaptainOnline() {
    const { socket } = store.getState().socket;
    if (socket) {
      const captainId = store.getState().user.user._id;
      socket.emit("captain_online", captainId);
    }
  }

  emitJoinRide(rideId) {
    const { socket } = store.getState().socket;
    if (socket) {
      socket.emit("join_ride", rideId);
    }
  }

  emitCaptainLocation(location) {
    const { socket } = store.getState().socket;
    if (socket) {
      socket.emit("captain_location", location);
    }
  }

  disconnect() {
    const { socket } = store.getState().socket;
    if (socket) {
      socket.disconnect();
      store.dispatch(setSocket(null));
      store.dispatch(setConnected(false));
    }
  }
}

export const socketService = new SocketService();
