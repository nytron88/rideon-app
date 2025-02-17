import { io } from "socket.io-client";
import { setSocket, setConnected, setError } from "../store/slices/socketSlice";
import { store } from "../store/store";

class SocketService {
  initialize() {
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true // This ensures cookies are sent with the request
    });

    socket.on("connect", () => {
      store.dispatch(setConnected(true));
    });

    socket.on("disconnect", () => {
      store.dispatch(setConnected(false));
    });

    socket.on("connect_error", (error) => {
      store.dispatch(setError(error.message));
    });

    store.dispatch(setSocket(socket));
    return socket;
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