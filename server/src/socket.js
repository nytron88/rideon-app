import { Server } from "socket.io";
import client from "./services/redis.service.js";
import ApiError from "./utils/ApiError.js";
import {
  getCaptainsInTheRadius,
  updateCaptainLocation,
} from "./services/maps.service.js";
import { User } from "./models/user.model.js";

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

    socket.on("captain_location", async (location) => {
      try {
        if (!socket.captainId) {
          throw new ApiError(400, "Captain not registered");
        }

        if (!location?.latitude || !location?.longitude) {
          throw new ApiError(400, "Invalid location data");
        }

        const locationKey = `location:${socket.captainId}`;
        await client.hset(locationKey, [
          "latitude",
          location.latitude.toString(),
          "longitude",
          location.longitude.toString(),
          "accuracy",
          (location.accuracy || 0).toString(),
          "timestamp",
          location.timestamp || new Date().toISOString(),
          "socketId",
          socket.id,
        ]);

        await client.expire(locationKey, 1800);

        await updateCaptainLocation(
          socket.captainId,
          location.latitude,
          location.longitude
        );

        if (socket.rideId) {
          const rideStr = await client.get(`ride:${socket.rideId}`);
          if (rideStr) {
            const ride = JSON.parse(rideStr);
            await notifyUser(ride.user, "user", "captain_location", {
              rideId: socket.rideId,
              location: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
            });
          }
        }
      } catch (error) {
        socket.emit("socket_error", {
          statusCode: error.statusCode || 500,
          event: "captain_location",
          message: error.message || "Failed to update location",
        });
      }
    });

    socket.on("ride_accepted", async (rideId) => {
      try {
        if (!socket.captainId) {
          throw new ApiError(400, "Captain not registered");
        }

        const rideKey = `ride:${rideId}`;
        const rideStr = await client.get(rideKey);
        if (!rideStr) {
          throw new ApiError(404, "Ride not found");
        }

        const ride = JSON.parse(rideStr);
        socket.rideId = rideId;

        await notifyUser(ride.user, "user", "ride_accepted", {
          rideId,
          captainId: socket.captainId,
        });
      } catch (error) {
        socket.emit("socket_error", {
          statusCode: error.statusCode || 500,
          event: "ride_accepted",
          message:
            error.message || "Failed to notify user about ride acceptance",
        });
      }
    });

    socket.on("join_ride", async (rideId) => {
      joinRide(rideId, socket.userId, socket.captainId);
    });

    socket.on("disconnect", async () => {
      try {
        if (socket.captainId) {
          await Promise.all([
            client.hdel(SOCKET_KEYS.CAPTAIN, socket.captainId),
            client.del(`captain:location:${socket.captainId}`),
          ]);
          console.log("Captain offline: ", socket.captainId);
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

async function joinRide(rideId, userId, captainId) {
  if (!io) {
    throw new ApiError(500, "Socket not initialized");
  }

  const rideKey = `ride:${rideId}`;
  const rideStr = await client.get(rideKey);
  if (!rideStr) {
    throw new ApiError(404, "Ride not found");
  }

  const ride = JSON.parse(rideStr);

  if (userId) {
    const userSocketId = await client.hget(SOCKET_KEYS.USER, userId);
    if (userSocketId) {
      io.to(userSocketId).emit("ride_joined", { rideId, captainId });
    }
  }

  if (captainId) {
    const captainSocketId = await client.hget(SOCKET_KEYS.CAPTAIN, captainId);
    if (captainSocketId) {
      io.to(captainSocketId).emit("ride_joined", { rideId, userId });
    }
  }

  return ride;
}

async function notifyNearbyCaptains(ride, pickupCoords) {
  if (!io) {
    throw new ApiError(500, "Socket not initialized");
  }

  const nearbyCaptains = await getCaptainsInTheRadius(
    pickupCoords.ltd,
    pickupCoords.lng,
    3
  );

  if (!nearbyCaptains.length) {
    throw new ApiError(404, "No captains found nearby");
  }

  const user = await User.findById(ride?.user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const notificationPromises = nearbyCaptains.map(async (captain) => {
    const socketId = await client.hget(SOCKET_KEYS.CAPTAIN, captain._id);
    if (!socketId) {
      return false;
    }

    io.to(socketId).emit("new_ride_request", {
      rideId: ride._id,
      pickup: ride.pickup,
      destination: ride.destination,
      fare: ride.fare,
      distance: ride.distance,
      estimatedTime: ride.duration,
      passengers: ride.passengers,
      rider: {
        name: user.fullname,
        photo: user.photo,
      },
    });
    return true;
  });

  const results = await Promise.all(notificationPromises);
  const notifiedCount = results.filter(Boolean).length;

  if (notifiedCount === 0) {
    throw new ApiError(500, "Failed to notify any nearby captains");
  }

  console.log(
    `Notified ${notifiedCount} of ${nearbyCaptains.length} nearby captains`
  );
}

export { initializeSocket, notifyUser, joinRide, notifyNearbyCaptains };
