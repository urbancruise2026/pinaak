import { Server } from "socket.io";
import registerSocketEvents from "./events/index.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || "http://localhost:3000")
        .split(",")
        .map((o) => o.trim().replace(/\/$/, "")),
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 30000,
  });

  io.on("connection", (socket) => {
    console.log("🟢 User Connected:", socket.id);

    registerSocketEvents(socket, io);

    socket.on("disconnect", () => {
      console.log("🔴 User Disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
