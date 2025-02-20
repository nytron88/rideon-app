import { Server } from "socket.io";
import client from "./services/redis.service.js";
import ApiError from "./utils/ApiError.js";

const SOCKET_KEYS = {
  USER: "socket:user",
  CAPTAIN: "socket:captain",
};

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("user_online", async (userId) => {
      try {
        if (!userId) {
          throw new ApiError(400, "User ID is required");
        }
        console.log("User online: ", userId);
        await client.hset(SOCKET_KEYS.USER, userId, socket.id);
        socket.userId = userId;
      } catch (error) {
        socket.emit("socket_error", {
          statusCode: error.statusCode || 500,
          event: "user_online",
          message: error.message || "Failed to register user online status",
        });
      }
    });

    socket.on("captain_online", async (captainId) => {
      try {
        if (!captainId) {
          throw new ApiError(400, "Captain ID is required");
        }
        console.log("Captain online: ", captainId);
        await client.hset(SOCKET_KEYS.CAPTAIN, captainId, socket.id);
        socket.captainId = captainId;
      } catch (error) {
        socket.emit("socket_error", {
          statusCode: error.statusCode || 500,
          event: "captain_online",
          message: error.message || "Failed to register captain online status",
        });
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (socket.captainId) {
          console.log("Captain offline: ", socket.captainId);
          await client.hdel(SOCKET_KEYS.CAPTAIN, socket.captainId);
        }
        if (socket.userId) {
          console.log("User offline: ", socket.userId);
          await client.hdel(SOCKET_KEYS.USER, socket.userId);
        }
      } catch (error) {
        socket.emit("socket_error", {
          statusCode: error instanceof ApiError ? error.statusCode : 500,
          event: "disconnect",
          message: error.message || "Failed to clean up socket connection",
        });
      }
    });
  });

  return io;
}

async function notifyUser(userId, type, event, data) {
  if (!io) {
    throw new ApiError(500, "Socket not initialized");
  }

  try {
    const hashKey = type === "captain" ? SOCKET_KEYS.CAPTAIN : SOCKET_KEYS.USER;
    const socketId = await client.hget(hashKey, userId);

    if (socketId) {
      io.to(socketId).emit(event, data);
    } else {
      console.error(`${type} socket not found:`, userId);
    }
  } catch (error) {
    console.error(`Error notifying ${type}:`, error);
  }
}

export { initializeSocket, notifyUser };
