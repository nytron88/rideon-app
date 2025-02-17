import { Server } from "socket.io";

let io;

function initializeSocket(server) {
  (io = new Server(server)),
    {
      cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
      },
    };

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function sendMessageToSocketId(socketId, message) {
  if (io) {
    io.to(socketId).emit("message", message);
  } else {
    console.error("Socket not initialized");
  }
}

export { initializeSocket, sendMessageToSocketId };
